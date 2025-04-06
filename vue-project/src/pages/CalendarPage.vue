<template>
  <div class="calendar-container">
    <h1 class="text-2xl font-bold mb-4">📅 학과 휴·보강 캘린더</h1>
    <iframe
      :src="calendarUrl"
      width="100%"
      height="600"
      frameborder="0"
      scrolling="no"
      style="border:0;"
    ></iframe>
  </div>
</template>

<script setup>
const calendarUrl = "https://calendar.google.com/calendar/embed?src=8d2bbe23e70bb5961d50ac7d654080b75227e5a8b2cf2d5915bd5405c45117ec@group.calendar.google.com&ctz=Asia%2FSeoul";
</script>

<style scoped>
.calendar-container {
  padding: 2rem;
}
</style>
