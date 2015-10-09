(function() {
  var token;

  function getJSON(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var resp = JSON.parse(xhr.responseText);
        cb(resp);
      }
    }
    xhr.send();
  }

  function showOpenIssues(repo, owner) {
    // FIXME - what if more than 100 open issues?
    url = 'https://api.github.com/repos/'+owner+'/'+repo+'/issues?per_page=100';
    if (token) {
      url = url + "&access_token=" + token;
    }

    getJSON(url, function(issues){
      var $list, issuesByUser = [];

      issues.forEach(function(issue){
        var user = issue.assignee.login;
        if (!(user in issuesByUser)) {
          issuesByUser[user] = 0;
        }
        issuesByUser[user]++;
      });

      users = Object.keys(issuesByUser).sort(function(a, b){
        if (issuesByUser[a] > issuesByUser[b]) {
          return 1;
        } else if (issuesByUser[a] < issuesByUser[b]) {
          return -1;
        }
        return 0;
      }).reverse();

      $list = document.querySelector('.jd__open-list');
      $list && $list.parentNode.removeChild($list);
      $list = document.createElement('div');
      $list.classList.add("jd__open-list");

      users.forEach(function(user){
        var $item, $count, $user, openState, openIssuesCount = issuesByUser[user];

        // Get user's actual name
        var user_url = 'https://api.github.com/users/'+user;
        if (token) {
          user_url = user_url + "?access_token=" + token;
        }

        getJSON(user_url, function (usrObj) {

          if ( openIssuesCount > 4 ) {
            openState = 'jd__danger';
          }
          else if (openIssuesCount > 2) {
            openState = 'jd__caution';
          }
          else {
            openState = 'jd__good';
          }

          $user = document.createElement('em');
          $user.classList.add('jd_open-list-user');
          $user.appendChild(document.createTextNode(usrObj.name.match(/([^\s]+)/i)[0]));

          $count = document.createElement('strong');
          $count.classList.add('jd_open-list-count');
          $count.appendChild(document.createTextNode(openIssuesCount));

          $item = document.createElement('div');
          $item.classList.add('jd_open-list-item');
          $item.classList.add(openState);
          $item.appendChild($user);
          $item.appendChild(document.createTextNode(' '));
          $item.appendChild($count);
          $item.setAttribute("data-user", user);
          $item.addEventListener("click", function(e){
            var user = e.currentTarget.getAttribute("data-user");
            var $input = document.querySelector("#js-issues-search");
            $input.value = "is:open is:issue assignee:" + user;
            $form = document.querySelector(".subnav-search");
            $form.submit();
          });

          if ( openIssuesCount > 2 ) {
            $list.appendChild($item);
          }

        });

      });

      document.querySelector('.subnav').appendChild($list);
    });
  }

  function showReviewButton() {
    var q = "is:closed -label:Complete -label:duplicate";
    var $a = document.createElement("a");
    $a.classList.add('subnav-item');
    $a.setAttribute("href", window.location.pathname + "?q=" + encodeURIComponent(q));
    $a.appendChild(document.createTextNode("Review"));
    document.querySelector(".subnav-links").appendChild($a);
  }

  function run() {
    var matches, repo, owner;

    matches = window.location.pathname.match(/^\/(.+)\/(.+)\/issues/);

    if (matches) {
      owner = matches[1];
      repo = matches[2];

      showOpenIssues(repo, owner);
      showReviewButton();
    }
  }

  function rerun(event) {
    // Wait for dom to catch up after push/pop state.
    // FIXME -- there should be a better way then just waiting an arbitrary amount of time.
    window.setTimeout(run, 1000);
  }

  function start() {
    // HACK -- cannot override window.pushState from extension
    // so inject a script into the page that does it.
    var code = 'var jd__Event = new Event("jd__pushstate");\nvar nativePushState = window.history.pushState;\nwindow.history.pushState = function() {\n  nativePushState.apply(window.history, arguments);\n window.dispatchEvent(jd__Event);\n};';
    var script = document.createElement("script");
    script.innerHTML = code;
    document.querySelector("body").appendChild(script);

    // Rerun after push/pop state
    window.addEventListener("jd__pushstate", rerun);
    window.addEventListener("popstate", rerun);

    run();
  }

  chrome.storage.sync.get('token', function(items) {
    token = items.token;
    start();
  });


})();
