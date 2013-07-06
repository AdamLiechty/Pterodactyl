function addSampleButton(caption, clickHandler) {
  var btn = document.createElement('input');
  btn.type = 'button';
  btn.value = caption;
  
  if (btn.attachEvent)
    btn.attachEvent('onclick', clickHandler);
  else
    btn.addEventListener('click', clickHandler, false);

  // add the button to the Sample UI
  document.getElementById('sample-ui').appendChild(btn);
}

function addSampleUIHtml(html) {
  document.getElementById('sample-ui').innerHTML += html;
}

function buttonClick() {
  var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
  lookAt.setLatitude(lookAt.getLatitude() + 2);
  lookAt.setLongitude(lookAt.getLongitude() + 20);
  ge.getView().setAbstractView(lookAt);
}
