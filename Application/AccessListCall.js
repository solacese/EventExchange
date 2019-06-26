    // EXAMPLE
    // Recursive API Calls to handle clients for ACL Admin
    //   AccessListCall("LTA", "POST", "LOL/>"); post to all agent's subscribe list
    //   AccessListCall("LTA", "POST", "LOL/>", "NEA, MOE"); post to all listed agent's subscribe list
    //   AccessListCall("LTA", "GET"); returns a list of published topics
    //   AccessListCall("LTA", "GETALL"); returns a list of topics available

function AccessListCall(username, type, value = '', filter = '', counter = 0){
    var dict = [];
    var uriSEMP = "";
    AccessInnerCall(username, type, value, counter, filter);
    function AccessInnerCall(username, type, value = '', counter = 0, filter = '') {
        var result;
        insertedtype = "GET";
        insertedvalue = '';
        switch(type){
            case "POST":
                if (counter == 1){
                    insertedtype = "POST";
                    insertedvalue = '{"publishExceptionTopic": "' + value + '", "topicSyntax" : "smf" }';
                }
                if (counter == 2){
                    insertedtype = "POST";
                    insertedvalue = '{"subscribeExceptionTopic": "' + value + '", "topicSyntax" : "smf" }';
                }
                break;
        }
        if (counter == 0){
            if (!filter){
                uriSEMP = "http://localhost:8080/SEMP/v2/config/msgVpns/default/clientUsernames/" + username;
            } else {
                uriSEMP = "http://localhost:8080/SEMP/v2/config/msgVpns/default/clientUsernames";
            }
        } else if (counter == 1) {
            uriSEMP = "http://localhost:8080/SEMP/v2/config/msgVpns/default/aclProfiles/" + username + "/publishExceptions";
        } else if (counter == 2){
            uriSEMP = "http://localhost:8080/SEMP/v2/config/msgVpns/default/aclProfiles/" + username + "/subscribeExceptions";
        } else if (counter == 3){
            uriSEMP = "http://localhost:8080/SEMP/v2/config/msgVpns/default/aclProfiles";
        }
        var data = '';
        // Make the REST API call.
        $.ajax({
            url: uriSEMP,
            // Request headers.
            beforeSend: function(xhrObj){
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader(
                    "Authorization", "Basic " + btoa("admin" + ":" + "admin"));
            },

            type: insertedtype,
            async: false,
            // Request body.
            data: insertedvalue,
        })

        .done(function(data) {
            switch (counter){
                case 0:
                    result = (data['data']['aclProfileName']);
                    counter += 1;
                    if (type == 'GET'){
                        AccessInnerCall(result, type, value, counter);
                    } else if (type == 'POST'){
                        if (filter) {
                            var acllist = [];
                            for (var i in data['data']){
                                if (String(filter).indexOf(data['data'][i]['clientUsername']) >= 0){
                                    acllist.push(data['data'][i]['aclProfileName']);
                                } else if (String(username).indexOf(data['data'][i]['clientUsername']) >= 0){
                                    username = data['data'][i]['aclProfileName'];
                                }
                            }
                            AccessInnerCall(username, type, value, counter, acllist);
                        } else {
                            AccessInnerCall(result, type, value, counter);
                        }
                    } else if (type == 'GETALL'){
                        AccessInnerCall(result, type, value, 2);
                    }
                    break;
                case 1:
                    for (var k in data['data']){
                        dict.push(data['data'][k]['publishExceptionTopic']);
                    }
                    if (type == 'POST'){
                        if (filter) {
                            for (var i in filter) {
                                AccessInnerCall(filter[i], type, value, 2);
                            }
                        } else {
                            AccessInnerCall(username, type, value, 3);
                        }
                    }
                    break;
                case 2:
                    if (type == 'GETALL'){
                        dict = [];
                        for (var i in data['data']){
                            dict.push(data['data'][i]['subscribeExceptionTopic']);
                        }
                    }
                    break;
                case 3:
                    for (var i in data['data']){
                        if (username != data['data'][i]['aclProfileName'] && data['data'][i]['aclProfileName'] != "#acl-profile"){
                            AccessInnerCall(data['data'][i]['aclProfileName'], type, value, 2);
                        }
                    }
                    break;
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
    if (dict[0]){
        return dict;
    }
}