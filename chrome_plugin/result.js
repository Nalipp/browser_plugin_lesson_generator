// Load the lesson plan from chrome.storage.local and display it
function renderLessonPlan(lessonPlanObj, url) {
  let html = '';
  if (url) {
    html += `<div style="margin-bottom: 1em; font-size: 0.98em;">
      <a href="${url}" target="_blank" rel="noopener" style="color:dodgerblue; text-decoration:underline; font-weight:600;">Original article</a>
    </div>`;
  }
  if (lessonPlanObj.title) html += `<h2>${lessonPlanObj.title}</h2>`;
  if (lessonPlanObj.intro)
    html += `<p><strong>Intro:</strong> ${lessonPlanObj.intro}</p>`;
  if (lessonPlanObj.summary)
    html += `<p><strong>Summary:</strong> ${lessonPlanObj.summary}</p>`;
  if (lessonPlanObj.initial_question)
    html += `<p><strong>Initial Question:</strong> ${lessonPlanObj.initial_question}</p>`;
  if (lessonPlanObj.questions) {
    html += '<h3>Questions</h3><ul>';
    lessonPlanObj.questions.forEach((q) => (html += `<li>${q}</li>`));
    html += '</ul>';
  }
  if (lessonPlanObj.more_substantial_discussion_topics) {
    html += '<h3>Discussion Topics</h3><ul>';
    lessonPlanObj.more_substantial_discussion_topics.forEach(
      (t) => (html += `<li>${t}</li>`)
    );
    html += '</ul>';
  }
  if (lessonPlanObj.common_expressions) {
    html += '<h3>Common Expressions</h3><ul>';
    lessonPlanObj.common_expressions.forEach((e) => (html += `<li>${e}</li>`));
    html += '</ul>';
  }
  return html;
}

document.addEventListener('DOMContentLoaded', function () {
  const lessonPlanDiv = document.getElementById('lesson-plan');
  const printBtn = document.getElementById('print-btn');

  chrome.storage.local.get(['processedContent', 'scrapedContent'], (data) => {
    let url = undefined;
    if (data.processedContent && data.processedContent.url) {
      url = data.processedContent.url;
    } else if (data.scrapedContent && data.scrapedContent.url) {
      url = data.scrapedContent.url;
    }
    if (data.processedContent && data.processedContent.lesson_plan) {
      let lessonPlanRaw = data.processedContent.lesson_plan;
      // Remove markdown code block if present
      lessonPlanRaw = lessonPlanRaw.replace(/^```json\n|```$/g, '').trim();
      let lessonPlanObj;
      try {
        lessonPlanObj = JSON.parse(lessonPlanRaw);
      } catch (e) {
        lessonPlanDiv.textContent = lessonPlanRaw;
        return;
      }
      lessonPlanDiv.innerHTML = renderLessonPlan(lessonPlanObj, url);
      printBtn.style.display = 'inline-block';
    } else {
      lessonPlanDiv.textContent = 'No lesson plan found.';
      printBtn.style.display = 'none';
    }
  });

  printBtn.addEventListener('click', () => {
    window.open(chrome.runtime.getURL('print.html'), '_blank');
  });
});
