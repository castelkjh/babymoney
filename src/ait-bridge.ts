// ────────────────────────────────────────────────────────────────
//  아기머니 · 앱인토스 브리지 (보상형 광고 연결)
//
//  쓰는 법: main.tsx 맨 윗줄에  import './ait-bridge';  한 줄 추가.
//  React가 화면을 그리기 전에 전역값 3개를 세팅해서,
//  app-runtime의 playAd()가 mock 카운트다운 대신 실제 토스 광고를 쓰게 함.
//  (앱 로직은 1도 안 건드림 — 전역값만 채워주는 역할)
// ────────────────────────────────────────────────────────────────
import { loadFullScreenAd, showFullScreenAd, share, getTossShareLink, Analytics } from '@apps-in-toss/web-framework';

const w = window as any;

// 0) 분석 이벤트 로거 (토스 콘솔 분석에 집계됨) — 광고 퍼널 계측용
//    __ait_log(name, params): 일반 이벤트(click) / __ait_logImp: 노출(impression)
w.__ait_log = (log_name: string, params?: Record<string, unknown>) => {
  try { Analytics.click(Object.assign({ log_name }, params || {})); } catch (e) { /* dev/preview: 무시 */ }
};
w.__ait_logImp = (log_name: string, params?: Record<string, unknown>) => {
  try { Analytics.impression(Object.assign({ log_name }, params || {})); } catch (e) { /* 무시 */ }
};

// 1) 광고 로드/표시 함수를 앱이 찾는 전역에 연결
w.__ait_loadFullScreenAd = loadFullScreenAd;
w.__ait_showFullScreenAd = showFullScreenAd;

// 1-2) 공유 함수도 전역에 연결 (공유 카드 버튼이 사용)
w.__ait_share = share;
w.__ait_getTossShareLink = getTossShareLink;

// 2) 광고 그룹 ID  (콘솔 > 인앱 광고 > 광고 그룹 > "진단결과_리워드광고")
//    ※ 운영 ID. 구글 반영 완료(최대 2시간) 후 실제 광고가 노출됨.
w.__BABYMONEY_AD_GID = 'ait.v2.live.7c2b3f43a16744ce';
