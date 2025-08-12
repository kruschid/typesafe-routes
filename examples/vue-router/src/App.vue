<script setup lang="ts">
import { render, renderPath } from 'typesafe-routes';
import { RouterLink, RouterView } from 'vue-router';
import { routes } from './router';
</script>

<template>
  <header>
    <nav>
      <RouterLink :to="renderPath(routes.dashboard, {})">Dashboard</RouterLink>
      <RouterLink :to="renderPath(routes.orgs, { orgId: 1 })">Orgs</RouterLink>
      <RouterLink
        :to="render(routes.orgs.locations, {
          path: { locationId: 42, orgId: 9 },
          query: { page: 5 }
        })"
      >
        Locations
      </RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
