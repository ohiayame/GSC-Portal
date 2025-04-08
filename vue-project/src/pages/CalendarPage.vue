<template>
  <div class="calendar-container">
    <h1 class="title">Schedule</h1>
    <div class="layout">
      <!-- 커스텀 캘린더 -->
      <div class="calendar-wrapper">
        <div class="calendar-header">
          <button class="nav-btn" @click="goToPrevMonth">◀</button>
          {{ formattedMonthTitle }}
          <button class="nav-btn" @click="goToNextMonth">▶</button>
        </div>
        <div class="calendar-grid">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar-cell"
            :class="{ empty: !day }"
            @click="day && scrollToSchedule(day.date)"
          >
            <div v-if="day" class="date-number">{{ day.day }}</div>
            <div v-if="day" class="event-bars">
              <div
                v-for="(color, idx) in eventsMap[day.date] || []"
                :key="idx"
                class="event-bar"
                :style="{ backgroundColor: colorMap[color] }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 일정 리스트 -->
      <div class="schedule-list modern-style">
        <div
          v-for="(day, index) in formattedSchedules"
          :key="index"
          class="schedule-day"
          :id="`schedule-${day.date}`"
        >
          <div class="schedule-date">
            <div class="day-number">{{ day.day }}</div>
            <div class="day-weekday">{{ day.weekday }}</div>
          </div>
          <div class="schedule-events">
            <div
              v-for="(event, idx) in day.events"
              :key="idx"
              class="event-item"
              :class="getEventClass(event.type)"
              @click="addToMyGoogleCalendar(day.date, event)"
              style="cursor: pointer"
            >
              <span class="event-tag">{{ event.type }}</span>
              <span class="event-time">{{ event.time }}</span>
              <span class="event-title">{{ event.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth() + 1)
const calendarDays = ref([])
const schedules = ref([])

const formattedSchedules = computed(() => {
  return schedules.value.map((s) => {
    const date = new Date(s.date)
    return {
      day: date.getDate(),
      weekday: weekdays[date.getDay()],
      date: s.date,
      events: s.events,
    }
  })
})

const eventsMap = computed(() => {
  const map = {}
  schedules.value.forEach((s) => {
    const colors = []
    s.events.forEach((e) => {
      if (e.type.includes('보강')) colors.push('red')
      else if (e.type.includes('휴강')) colors.push('blue')
      else if (e.type === '공휴일') colors.push('gray')
      else colors.push('yellow')
    })
    map[s.date] = colors
  })
  return map
})

const colorMap = {
  red: '#e45d78',    // 보강
  blue: '#5c9edc',   // 휴강
  yellow: '#f2c84a', // 학과 공지
  gray: '#9e9e9e',
}

function getEventClass(type) {
  if (type.includes('보강')) return 'event-item-red'
  if (type.includes('휴강')) return 'event-item-blue'
  if (type === '공휴일') return 'event-item-gray'
  return 'event-item-yellow'
}


function scrollToSchedule(date) {
  const el = document.getElementById(`schedule-${date}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function generateCalendar(year, month) {
  const result = []
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let i = 0; i < firstDay; i++) result.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    result.push({ day: d, date })
  }
  return result
}

function goToPrevMonth() {
  if (calendarMonth.value === 1) {
    calendarMonth.value = 12
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
  updateCalendar()
}

function goToNextMonth() {
  if (calendarMonth.value === 12) {
    calendarMonth.value = 1
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
  updateCalendar()
}

const formattedMonthTitle = computed(() => {
  return `${calendarYear.value}년 ${calendarMonth.value}월`
})

async function updateCalendar() {
  calendarDays.value = generateCalendar(calendarYear.value, calendarMonth.value)
  const start = `${calendarYear.value}-${String(calendarMonth.value).padStart(2, '0')}-01T00:00:00Z`
  const endMonth = calendarMonth.value + 1 > 12 ? 1 : calendarMonth.value + 1
  const endYear = calendarMonth.value + 1 > 12 ? calendarYear.value + 1 : calendarYear.value
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01T00:00:00Z`

  const res = await axios.get(`http://localhost:3001/api/calendar/?timeMin=${start}&timeMax=${end}`)
  const items = res.data

  // Google 이벤트 데이터 → [{ date, events: [{ type, time, title }] }] 형식으로 변환
  const eventMap = {}
  items.forEach(event => {
    const date = event.date;
    const title = event.title;
    const time = event.time;
    const type = event.type;

    if (!eventMap[date]) eventMap[date] = []
    eventMap[date].push({ type, time, title })
  })

  schedules.value = Object.keys(eventMap).map(date => ({
    date,
    events: eventMap[date]
  }))
}

function convertTo24Hour(date, timeStr) {
  let [ampm, time] = timeStr.split(' ')
  if (!ampm || !time) return null

  let [hour, minute] = time.split(':').map(Number)
  if (ampm === '오후' && hour !== 12) hour += 12
  if (ampm === '오전' && hour === 12) hour = 0

  return new Date(`${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`)
}


function addToMyGoogleCalendar(date, event) {
  const startDateTime = convertTo24Hour(date, event.time)
  if (!startDateTime) {
    console.error("시간 변환 실패", event.time)
    return
  }

  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000)

  const formatDate = (d) =>
    d.toISOString().replace(/[-:]|\.\d{3}/g, '').slice(0, 15) + 'Z'

  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.set('action', 'TEMPLATE')
  url.searchParams.set('text', event.title)
  url.searchParams.set('dates', `${formatDate(startDateTime)}/${formatDate(endDateTime)}`)
  url.searchParams.set('details', `${event.type} 일정입니다.`)
  url.searchParams.set('location', '학과 강의실')

  window.open(url.toString(), '_blank')
}

onMounted(updateCalendar)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;700&display=swap');

.calendar-container {
  padding: 2rem;
  background: linear-gradient(135deg, #f0f5ff, #e8f0ff);
  min-height: 100vh;
  font-family: 'Nunito', sans-serif;
  color: #333;
}

.title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #213b75;
  text-align: center;
  font-family: 'Urbanist', 'Nunito', sans-serif;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}
.title::after {
  content: '';
  display: block;
  margin: 0 auto;
  width: 170px;
  height: 4px;
  background: linear-gradient(to right, #6db4ff, #007bff);
  border-radius: 2px;

}

.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
}

.schedule-list {
  width: 100%;
  background: #ffffffee;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 64, 128, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


.day-icon {
  margin-right: 0.5rem;
}

.schedule-item {
  background: #f2f7ff;
  border-left: 4px solid #6db4ff;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 64, 128, 0.05);
}

.calendar-wrapper {
  width: 40%;
  min-width: 280px;
  max-width: 380px;
  background: #ffffffee;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #213b75;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.4rem;
}

.calendar-cell {
  background: #f4f8fc;
  border-radius: 0.6rem;
  padding: 0.4rem;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s;
}
.calendar-cell:hover {
  background-color: #e4edf7;
}

.calendar-cell.empty {
  background: transparent;
  box-shadow: none;
}

.date-number {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.event-bars {
  margin-top: 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-bar {
  height: 4px;
  border-radius: 4px;
}

/* 일정 리스트 - modern-style */
.schedule-list.modern-style {
  width: 75%;
  max-width: 700px;
  background: #ffffffee;
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 64, 128, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.schedule-day {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #e0eafc;
  padding-bottom: 1rem;
}

.schedule-date {
  text-align: center;
  min-width: 50px;
}

.day-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2e3d77;
}

.day-weekday {
  font-size: 0.9rem;
  color: #8ca1c3;
}

.schedule-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-item {
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  background: #f7faff;
  border-left: 4px solid #6db4ff;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 64, 128, 0.05);
  transition: background-color 0.3s;
}
.event-item:hover {
  background-color: #e4edf7;
}

.event-item-red {
  border-left-color: #e45d78;
  background-color: #fff3f5;
}

.event-item-blue {
  border-left-color: #5c9edc;
  background-color: #e5f0ff;
}

.event-item-yellow {
  border-left-color: #f2c84a;
  background-color: #fff9e5;
}

.event-item-gray {
  border-left-color: #9e9e9e;
  background-color: #f2f2f2;
}

.event-tag {
  font-size: 0.75rem;
  font-weight: bold;
  color: #0a58ca;
}

.event-time {
  font-size: 0.8rem;
  color: #333;
}

.event-title {
  font-size: 0.9rem;
  font-weight: 600;
}
.calendar-header {
  text-align: center;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #213b75;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  background: #e8f0ff;
  border: none;
  border-radius: 0.5rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  font-size: 1rem;
  color: #213b75;
  font-weight: bold;
  transition: background 0.2s ease;
}
.nav-btn:hover {
  background: #d0e4ff;
}

</style>
