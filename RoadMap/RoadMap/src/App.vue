
<template>
  <Map/>
</template>

<script>
import { provide } from 'vue';
import map from './map/map';
import Map from './components/Map.vue';

  export default{
    setup() {
        provide("data", map);
    },
    components: { Map }
}
</script>
