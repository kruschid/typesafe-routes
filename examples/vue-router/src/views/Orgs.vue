<script lang="ts">
import { routes } from '@/router';
import { parsePath } from 'typesafe-routes/vue-router';
import { useRoute,  } from 'vue-router'

const params = useRoute().params; // Record<string, RouteParamValue | RouteParamValue[]>
const parsedParams = parsePath(routes.orgs, params) // RouteParamValue[] array is the problem here
</script>

<template>
  <h2>Orgs</h2>
  <pre>params: {{JSON.stringify(parsedParams)}}</pre>
</template>
