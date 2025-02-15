// stores/data.js
import { defineStore } from 'pinia';

export const useDataStore = defineStore('data', {
    state: () => ({
        count: 0,
        subjects: []
    }),
    actions: {
        // count
        increment() {
            this.count++;
        },
        decrement() {
            this.count--;
        },
        // checkbox
        addSubject(text) {   // 추가
            this.subjects.push({ text, checked: false });
        },
        removeSubject(index) {  // 삭제 
            this.subjects.splice(index, 1);
        },
        editSubject(index, newText) { // 수정
        this.subjects[index].text = newText;
        },
        // check
        toggleCheck(index) {
            this.subjects[index].checked = !this.subjects[index].checked;
        }
    }
});
