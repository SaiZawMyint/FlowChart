import { reactive } from "vue";

const map = reactive({
    title: "Hello",
    description: "",
    link: ""
});

const data = [{title: "Vue",description: "Learn Vue Frontend Framework",link:"https:/vuejs.org"}];
export default{
    map,
    data
}