var History = function () {}
History.prototype.download = function (history) {
  document.getElementById('info-text').innerText = 'generating file, please wait...';

  var filename = "history.json";
  var virtual_element = document.createElement('a');
  var new_history = [];
  var index;

  for (index = 0; index < history.length; ++index) {
    new_history.push({
      'id': history[index].id,
      'lastVisitTime': new Date(history[index].lastVisitTime).toLocaleString(),
      'lastVisitTimeTimestamp': history[index].lastVisitTime,
      'title': history[index].title,
      'typedCount': history[index].typedCount,
      'url': history[index].url,
      'visitCount': history[index].visitCount
    });
  }

  var blob = new Blob(
    [JSON.stringify(new_history, undefined, 4)], {
      type: 'application/octet-binary'
    }
  );
  var url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  }, function afterDownload(id) {
    if (typeof (id) != 'undefined') {
      document.getElementById('info-text').innerText = '';
    }
  });
}

History.prototype.prepareHistoryJSON = function (history) {}

// 显示搜索数据
History.prototype.show = function (history) {
  var data = [];
  var index;
  for (i = 0; i < history.length; i++) {
    var item = history[i]
    if (item.url) {
      if (item.url.indexOf('https://www.google.com/search') >= 0) {
        data.push(item)
        var aDom = document.getElementById('show-items')
        var li = document.createElement('li')
        li.innerHTML = item.title
        aDom.appendChild(li)
      }
    }
  }
}

// 上传历史数据到服务器 
History.prototype.upload = function (history) {
  var data = [];
  var index;
  for (index = 0; index < history.length; ++index) {
    data.push({
      'id': history[index].id,
      'lastVisitTime': new Date(history[index].lastVisitTime).toLocaleString(),
      'lastVisitTimeTimestamp': history[index].lastVisitTime,
      'title': history[index].title,
      'typedCount': history[index].typedCount,
      'url': history[index].url,
      'visitCount': history[index].visitCount
    });
  }
  const xhr = new XMLHttpRequest()
  xhr.open("POST", "http://localhost:8080/coupons/getJson", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data))
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status == 200) {
      alert("ok");
    }
  }
}

History.prototype.getHistory = function (days, callback) {
  var now = new Date();
  var startTime = this.daysBefore(now, days);
  chrome.history.search({
    'text': '',
    'maxResults': 1000000,
    'startTime': startTime,
    // }, this.download);
  }, function (data) {
    callback && callback(data)
  });
}

History.prototype.daysBefore = function (date, days) {
  date.setDate(date.getDate() - days);
  timestamp = date.getTime();
  return timestamp;
}

document.addEventListener('DOMContentLoaded', function () {
  var history = new History();

  document.getElementById('btn-day').onclick = function () {
    history.getHistory(1, function (data) {
      history.download(data)
    });
  };
  document.getElementById('btn-week').onclick = function () {
    history.getHistory(7, function (data) {
      history.download(data)
    });
  };
  document.getElementById('btn-all').onclick = function () {
    history.getHistory(100, function (data) {
      history.download(data)
    });
  };
  document.getElementById('btn-show').onclick = function () {
    history.getHistory(7, function (data) {
      history.show(data)
    })
  }
});