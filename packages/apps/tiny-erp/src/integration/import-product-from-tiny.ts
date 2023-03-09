import type { Products } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import postTiny from './post-tiny-erp';
import parseProduct from './parsers/product-from-tiny';

export default async (apiDoc, queueEntry, appData, canCreateNew, isHiddenQueue) => {
  const [queueSku, queueProductId] = String(queueEntry.nextId).split(';:');
  let product: Products | null = null;
  try {
    product = (await api.get(`products/${(queueProductId || `sku:${queueSku}`)}`)).data;
  } catch (err: any) {
    if (err.statusCode !== 404) {
      throw err;
    }
  }
  let hasVariations: boolean = false;
  let variationId: string | undefined;
  if (product) {
    const { variations } = product;
    hasVariations = Boolean(variations && variations.length);
    const variation = variations?.find(({ sku }) => queueSku === sku);
    if (variation) {
      variationId = variation._id;
    } else {
      logger.info(`SKU not found ${queueSku}`);
      if (!isHiddenQueue && !appData.update_product) {
        const msg = queueSku
          + ' corresponde a um produto com variações,'
          + ' especifique o SKU da variação para importar.';
        const err: any = new Error(msg);
        err.isConfigError = true;
        return err;
      }
      return null;
    }
  }

  const handleTinyStock = ({ produto: produtoSaldo, tipo }, tinyProduct?) => {
    let quantity = Number(produtoSaldo.saldo) || Number(produtoSaldo.estoqueAtual);
    if (produtoSaldo.saldoReservado) {
      quantity -= Number(produtoSaldo.saldoReservado);
    }
    if (product && (!appData.update_product || variationId)) {
      if (!Number.isNaN(quantity)) {
        if (quantity < 0) {
          quantity = 0;
        }
        let endpoint = `products/${product._id}`;
        if (variationId) {
          endpoint += `variations/${variationId}`;
        }
        endpoint += '/quantity';
        logger.info(endpoint, { quantity });
        // @ts-ignore
        return api.put(endpoint, quantity);
      }
      return null;
    }
    if (!tinyProduct) {
      return null;
    }

    return postTiny('/produto.obter.php', { id: tinyProduct.id })
      .then(({ produto }) => {
        let method;
        let endpoint;
        let productId = product && product._id;
        if (productId) {
          method = 'PATCH';
          endpoint = `products/${productId}`;
        } else if (tipo === 'produto' || !tipo) {
          method = 'POST';
          endpoint = 'products';
        } else {
          return null;
        }
        // @ts-ignore
        return parseProduct(produto, method === 'POST').then((parsedProduct: Products) => {
          if (!Number.isNaN(quantity)) {
            parsedProduct.quantity = quantity >= 0 ? quantity : 0;
          }
          logger.info(`${method} ${endpoint}`);
          const promise = api({
            method,
            endpoint,
            data: parsedProduct,
          });

          if (Array.isArray(produto.variacoes) && produto.variacoes.length) {
            if (!queueEntry.app) {
              logger.warn('Variations cannot be queued without `queueEntry.app`');
              return promise;
            }
            promise.then((response) => {
              let skus = appData.__importation && appData.__importation.skus;
              if (!Array.isArray(skus)) {
                skus = [];
              }
              let isQueuedVariations = false;
              produto.variacoes.forEach(({ variacao }) => {
                const { codigo } = variacao;
                let skuAndId = codigo;
                if (!productId) {
                  productId = response.data && response.data._id;
                }
                if (productId) {
                  skuAndId += `;:${productId}`;
                }
                if (!skus.includes(codigo) && !skus.includes(skuAndId)) {
                  isQueuedVariations = true;
                  skus.push(skuAndId);
                }
              });
              return isQueuedVariations
                ? updateAppData(queueEntry.app, {
                  __importation: {
                    ...appData.__importation,
                    skus,
                  },
                })
                : response;
            });
          }
          return promise;
        });
      });
  };

  logger.info(JSON.stringify({
    queueSku,
    queueProductId,
    hasVariations,
    variationId,
  }));
  const { tinyStockUpdate } = queueEntry;
  if (tinyStockUpdate && isHiddenQueue && queueProductId) {
    return handleTinyStock(tinyStockUpdate as any);
  }
  return postTiny('/produtos.pesquisa.php', { pesquisa: queueSku })
    .then(({ produtos }) => {
      if (Array.isArray(produtos)) {
        let tinyProduct = produtos.find(({ produto }) => queueSku === String(produto.codigo));
        if (tinyProduct) {
          tinyProduct = tinyProduct.produto;
          if (!hasVariations || variationId) {
            if (tinyStockUpdate) {
              return handleTinyStock(tinyStockUpdate as any, tinyProduct);
            }
            return postTiny('/produto.obter.estoque.php', { id: tinyProduct.id })
              .then((tinyStock) => handleTinyStock(tinyStock, tinyProduct));
          }
          return handleTinyStock({ produto: {} } as any, tinyProduct);
        }
      }
      const msg = `SKU ${queueSku} não encontrado no Tiny`;
      const err: any = new Error(msg);
      err.isConfigError = true;
      throw new Error(err);
    });
};
