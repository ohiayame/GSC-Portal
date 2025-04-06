<template>
  <div class="calendar-container">
    <h1 class="title">📅 학과 휴·보강 캘린더</h1>
    <div class="layout">
      <!-- 오른쪽 커스텀 캘린더 -->
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

      <!-- 왼쪽 일정 리스트 -->
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
      else colors.push('yellow')
    })
    map[s.date] = colors
  })
  return map
})

const colorMap = {
  red: '#e45d78',
  blue: '#5c9edc',
  yellow: '#f2c84a',
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
    if (!event.start?.dateTime) return
    const date = event.start.dateTime.slice(0, 10)
    const time = new Date(event.start.dateTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    const title = event.summary || '(제목 없음)'

    const type =
      title.includes('보강') ? '보강' :
      title.includes('휴강') ? '휴강' :
      '기타'

    if (!eventMap[date]) eventMap[date] = []
    eventMap[date].push({ type, time, title })
  })

  schedules.value = Object.keys(eventMap).map(date => ({
    date,
    events: eventMap[date]
  }))
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
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #213b75;
  text-shadow: 1px 1px 0 #fff;
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



.schedule-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  border-bottom: 2px solid #aad3ff;
  padding-bottom: 0.5rem;
  color: #0a58ca;
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
  width: 30%;
  min-width: 280px;
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
  width: 70%;
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
