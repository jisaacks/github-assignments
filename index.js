(function() {
  var matches, owner, repo, url;

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

  matches = window.location.pathname.match(/^\/(.+)\/(.+)\/issues$/);

  if (matches) {
    owner = matches[1];
    repo = matches[2];

    // FIXME - what if more than 100 open issues?
    url = 'https://api.github.com/repos/'+owner+'/'+repo+'/issues?per_page=100';

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
        } else {
          return 0;
        }
      }).reverse();

      $list = document.createElement('div');
      $list.classList.add("jd__open-list");

      users.forEach(function(user){
        var $item, $count, $user, openState, openIssuesCount = issuesByUser[user];

        if ( openIssuesCount > 4 ) {
          openState = 'danger';
        }
        else if (openIssuesCount > 2) {
          openState = 'caution';
        }
        else {
          openState = 'good';
        }

        $user = document.createElement('em');
        $user.classList.add('jd_open-list-user');
        $user.appendChild(document.createTextNode(user));


        $count = document.createElement('strong');
        $count.classList.add('jd_open-list-count-' + openState);
        $count.appendChild(document.createTextNode(openIssuesCount));

        $item = document.createElement('div');
        $item.classList.add('jd_open-list-item');
        $item.appendChild($user);
        $item.appendChild(document.createTextNode(' '));
        $item.appendChild($count);

        $list.appendChild($item);
      });

      document.querySelector('.subnav').appendChild($list);
    });

  }
})();
