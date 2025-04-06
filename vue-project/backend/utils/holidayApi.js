import axios from 'axios';

export const getHolidays = async (year, month) => {
  const serviceKey = process.env.HOLIDAY_API_KEY; // 환경변수에 넣어두면 보안↑

  const url = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo';

  const params = {
    ServiceKey: decodeURIComponent(serviceKey), // 인코딩된 키는 꼭 디코딩!
    solYear: year,
    solMonth: String(month).padStart(2, '0'),
    _type: 'json'
  };

  try {
    const response = await axios.get(url, { params });
    const holidays = response.data.response.body.items?.item || [];
    return holidays;
  } catch (err) {
    console.error('[공휴일 API 오류]', err.message);
    return [];
  }
};
