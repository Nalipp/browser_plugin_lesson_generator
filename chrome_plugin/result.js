// Load the lesson plan from chrome.storage.local and display it
chrome.storage.local.get('processedContent', (data) => {
  if (data.processedContent && data.processedContent.lesson_plan) {
    let lessonPlanRaw = data.processedContent.lesson_plan;
    // Remove markdown code block if present
    lessonPlanRaw = lessonPlanRaw.replace(/^```json\n|```$/g, '').trim();
    let lessonPlanObj;
    try {
      lessonPlanObj = JSON.parse(lessonPlanRaw);
    } catch (e) {
      // If parsing fails, just display the raw string
      document.getElementById('lesson-plan').textContent = lessonPlanRaw;
      return;
    }
    // Format the lesson plan nicely
    let html = '';
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
    document.getElementById('lesson-plan').innerHTML = html;
  } else {
    document.getElementById('lesson-plan').textContent = 'No lesson plan found.';
  }
});
