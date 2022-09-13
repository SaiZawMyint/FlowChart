<template>
  
</template>

<script>
import { provide } from 'vue';
import map from './map/map';

  export default{
    setup(){
      provide('map', map)
    }
  }
</script>
