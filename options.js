function addToken(event) {
  event.preventDefault();
  var token = document.querySelector('.token').value;
  chrome.storage.sync.set({'token': token}, function() {
    hasToken(true);
  });
}

function removeToken(event) {
  event.preventDefault();
  chrome.storage.sync.set({'token': null}, function() {
    hasToken(false);
  });
}

function hasToken(has) {
  if (has) {
    form.addEventListener('submit', removeToken);
    form.removeEventListener('submit', addToken);
    addEl.style.display = 'none';
    removeEl.style.display = 'initial';
  }
  else {
    form.addEventListener('submit', addToken);
    form.removeEventListener('submit', removeToken);
    removeEl.style.display = 'none';
    addEl.style.display = 'initial';
  }
}

var form = document.querySelector('#github_assignments_options');
var addEl = document.querySelector('.add-token');
var removeEl = document.querySelector('.remove-token');

chrome.storage.sync.get('token', function(items) {
  hasToken(!!items.token);
});
