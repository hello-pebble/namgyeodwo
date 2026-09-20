export default function About() {
  return <article className="content-page">
    <p className="page-kicker">남겨둬를 만든 이유</p>
    <h1 className="page-title">기억하고 싶은 모든 일을,<br />제때 남길 수 있도록.</h1>
    <p className="page-description">우리는 하루에도 많은 이야기를 듣고 약속을 합니다. 중요한 순간일수록 나중에 날짜나 말을 정확히 떠올리기 어렵습니다. 남겨둬는 그 순간을 간단히 기록하고 다시 찾도록 돕습니다.</p>

    <section className="content-card"><h2>한 줄에서 시작해요</h2><p>업무에서 정한 일정, 친구와의 약속, 병원에서 들은 설명, 생활 속 작은 변화까지. 기억나는 대로 적으면 AI가 일시·장소·관련자·내용을 나눠 정리합니다. 말하지 않은 사실은 채워 넣지 않으며, 저장 전에 직접 확인할 수 있습니다.</p></section>
    <section className="content-card"><h2>필요한 순간에 다시 꺼내요</h2><p>기록이 쌓이면 시간순으로 살펴보고 리포트로 정리할 수 있습니다. 공유하거나 인쇄하기 좋은 문서도 만들 수 있어요. AI가 만든 리포트는 참고용이므로 중요한 판단에는 원래 기록과 관련 자료를 함께 확인해 주세요.</p></section>
    <section className="content-card"><h2>기록은 내 브라우저에 보관해요</h2><p>로그인 없이 사용할 수 있으며 저장한 기록은 현재 브라우저에 남습니다. 브라우저 데이터를 지우면 기록을 볼 수 없으니, 필요한 내용은 홈에서 JSON 파일로 백업해 두세요. AI 정리를 요청할 때 입력한 내용은 처리 서버로 전송됩니다.</p></section>
  </article>;
}
