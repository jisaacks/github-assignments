(function() {

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

  function run() {
    var matches, owner, repo, url;

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
          $user.appendChild(document.createTextNode(user));

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

          $list.appendChild($item);
        });

        document.querySelector('.subnav').appendChild($list);
      });

    }
  }

  run();

})();
