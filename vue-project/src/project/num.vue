<template>
    

    <h3>{{ count }}</h3>
    <button @click="add(true)">up</button>
    <button @click="add(false)">down</button>

</template>

<script setup>
import { ref, onMounted } from "vue"; 

const count = ref(0);

const loadFromLocalStorage = () => {
    const savedcount = localStorage.getItem("count");
    if (savedcount) {
        count.value = JSON.parse(savedcount);
    }
};
const saveToLocalStorage = () =>{
    localStorage.setItem("count", JSON.stringify(count.value));
};
const add = (isUp) => {
    if (isUp) { // 입력 값이 있으면면
        count.value++;
    }else{
        count.value--;
    }
    saveToLocalStorage();
};

onMounted(loadFromLocalStorage);
</script>