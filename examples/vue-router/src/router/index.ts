import Dashboard from '@/views/Dashboard.vue';
import Locations from '@/views/Locations.vue';
import Orgs from '@/views/Orgs.vue';
import { createRoutes, int, template } from 'typesafe-routes';
import { createRouter, createWebHistory } from 'vue-router';

export const routes = createRoutes({
  dashboard: {
    path: ["dashboard"]
  },
  orgs: {
    path: ["orgs", int("orgId")],
    children: {
      locations: {
        path: ["locations", int("locationId")],
        query: [int("page")],
      }
    }
  }
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: template(routes.dashboard),
      component: Dashboard,
    },
    {
      path: template(routes.orgs),
      component: Orgs,
      children: [{
        path: template(routes.orgs._.locations),
        component: Locations,
      }]
    },
  ],
})

export default router
