function processgov(callback) {
  var subscriptionKey = "5eb74f8f5a844acaa8c29118c43c83a6";
  var uriBase =
      "https://api.data.gov.sg/v1/transport/traffic-images";

  // Request parameters.
  var now = new Date();
  var month = ("0" + (now.getMonth() + 1).toString()).slice(-2);
  var date = ("0" + now.getDate().toString()).slice(-2);
  var hour = ("0" + now.getHours().toString()).slice(-2);
  var minute = ("0" + now.getMinutes().toString()).slice(-2);
  var second = ("0" + now.getSeconds().toString()).slice(-2);
  var today = now.getFullYear() + '-' + month + '-' + date + 'T' + hour + ':' + minute + ':' + second;
  var params = {
      "date_time": today
  };

  $.ajax({
      url: uriBase + "?" + $.param(params),

      beforeSend: function(xhrObj){
          xhrObj.setRequestHeader("Content-Type","application/json");
      },

      type: "GET",
  })

  .done(function(data) {
      result = JSON.parse(JSON.stringify(data,null,2));
      var cameras = result.items[0].cameras;
      var resdict = [];
      for (var i = 0; i < 1; i++){
        processImage(cameras[i].image, function(imgres, resulvar){
          resdict.push({"image" : imgres, "tags" : resulvar});
          if (resdict.length >= 1) {
            callback(resdict);
          }
        }
      );

    }

  })

  .fail(function(jqXHR, textStatus, errorThrown) {
      // Display error message.
      var errorString = (errorThrown === "") ? "Error. " :
          errorThrown + " (" + jqXHR.status + "): ";
      errorString += (jqXHR.responseText === "") ? "" :
          jQuery.parseJSON(jqXHR.responseText).message;
      alert(errorString);
  });
  };
