import { resources } from './mockData';

export const resourceService = {
  async list() {
    return resources;
  },
};
