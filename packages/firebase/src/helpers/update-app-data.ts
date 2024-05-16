import type { Applications, AppEventsPayload } from '@cloudcommerce/types';
import { PubSub } from '@google-cloud/pubsub';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import { EVENT_SKIP_FLAG, GET_PUBSUB_TOPIC } from '../const';

const updateAppData = async <A extends Applications | Applications['_id']>(
  application: A,
  data: Record<string, any>,
  options: {
    isHiddenData?: boolean,
    canSendPubSub?: A extends Applications ? boolean : false,
  } = {},
) => {
  const {
    isHiddenData = false,
    canSendPubSub = true,
  } = options;
  const applicationId = typeof application === 'string'
    ? application as Applications['_id']
    : application._id;
  const subresource = isHiddenData ? 'hidden_data' : 'data';
  if (typeof application === 'object' && canSendPubSub) {
    application[subresource] = data;
    const json: AppEventsPayload = {
      evName: 'applications-dataSet',
      apiEvent: {
        timestamp: new Date().toISOString(),
        resource_id: applicationId,
        action: 'update',
        modified_fields: [subresource],
        authentication_id: null,
      },
      apiDoc: application,
      app: {
        _id: applicationId,
        app_id: application.app_id,
        data: application.data,
        hidden_data: application.hidden_data,
      },
      isInternal: true,
    };
    try {
      await new PubSub()
        .topic(GET_PUBSUB_TOPIC(application.app_id))
        .publishMessage({ json });
    } catch (err) {
      logger.error(err);
    }
  }
  return api.patch(`applications/${applicationId}/${subresource}`, data, {
    headers: {
      'X-Event-Flag': EVENT_SKIP_FLAG,
    },
  });
};

export default updateAppData;
