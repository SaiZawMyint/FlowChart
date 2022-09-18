<template>
    <ul class="map-tit map-header">
        <li v-for="data in map.data">
            {{data.title}}
        </li>
    </ul>
    
</template>
<script>
    import {inject} from 'vue';
    export default{
        name: 'Map',
        setup(){
            const map = inject('data')
            
            console.log(map)



            return {
                map
            }
        }
    }
</script>