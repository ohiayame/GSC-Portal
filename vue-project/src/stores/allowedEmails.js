import { defineStore } from 'pinia';
import axios from 'axios';

export const useAllowedEmailStore = defineStore('allowedEmails', {
  state: () => ({
    emails: [],
  }),
  actions: {
    async fetchAllowedEmails() {
      const res = await axios.get('http://localhost:3001/api/allowed-emails');
      this.emails = res.data;
    },
    async addAllowedEmail(email, memo) {
      console.log(email, memo)
      const res = await axios.post('http://localhost:3001/api/allowed-emails', {
        email, memo });
      this.emails.push({ email, memo }); // 또는 await this.fetchAllowedEmails();
      return res.data;
    },
    async deleteAllowedEmail(email) {
      await axios.delete(`http://localhost:3001/api/allowed-emails/${encodeURIComponent(email)}`);
      this.emails = this.emails.filter(e => e.email !== email);
    }
  }
});
