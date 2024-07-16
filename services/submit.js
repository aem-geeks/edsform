export function browserId() {
    const browser = new Map();
    browser.set("ipAddress", "192.168.1.1");
    browser.set("userAgent", navigator.userAgent);
    const browserPayload = JSON.stringify(Object.fromEntries(browser));
    //console.log("==Browse User===> ",browserPayload);
    return browserPayload;
}


function createPayload(form,fd,keys){
    //const payload = new Map();
    const payload = new FormData();
    if(fd.ServiceId!=="browserId"){
      keys.split(',').forEach((key)=>{
       //console.log(" Pay Load => ",key,form.elements[key].value);
       if(fieldExists(form,key)){
         if(getFieldValue(form,key)!=="NA"){
           console.log(" Adding to Payload => ",key,getFieldValue(form,key));
           //payload.set(key,getFieldValue(form,key));
           payload.append(key,getFieldValue(form,key));
         }
       }
      });
      //return JSON.stringify(Object.fromEntries(payload));
      return payload;
    }else if(fd.ServiceId=="browserId"){
       return browserId();
    }
}

function getFieldValue(form,key){
   if(form.elements[key].value){
       return form.elements[key].value;
   }
   return "NA";
}

function fieldExists(form,key){
    if(form.elements[key]!==undefined){
        return true
    }
    return false;
}

function queryParamter(form,keys){
    if(keys.split(',').length==0){
        return null;
    }
    let qps="?";
      keys.split(',').forEach((key)=>{
       if(fieldExists(form,key)){
         if(getFieldValue(form,key)!=="NA"){
           console.log(" Adding to Query => ",key,getFieldValue(form,key));
           if(qps.length==1){
            qps=qps+(key+"="+getFieldValue(form,key));
           }else{
            qps=qps+("&"+key+"="+getFieldValue(form,key));
           }
         }
       }
      });
    return qps;
}


async function getServices(formURL){
    const form=document.querySelector("form");

    const serviceURL=await formURL+"?sheet=services";
    console.log("==serviceURL==",serviceURL);
    const resp = await fetch(serviceURL);
    //console.log("=====RESP=====> {} ",resp);
    const json = await resp.json();

    json.data.forEach((fd) => {
      //console.log("===Service Information ===> {} ",fd.ServiceId,fd.Url,fd.Params,fd.Payload);
      let qpString=null;
      let serviceId=null;
      let apiUrl=null;
      let payloadString=null;
      for (let fp in fd) {
        switch (fp) {
          case 'ServiceId':
            serviceId=fd.ServiceId;
            break;
          case 'Url':
            apiUrl=fd.Url;
            break;
          case 'Params':
            //qpString=createQP(form,fd[fp]);
            qpString=queryParamter(form,fd[fp]);
            break;
          case 'Payload':
            payloadString=createPayload(form,fd,fd[fp]);
            break;
          default:
            //console.log("=This is default case=");
        }
     }
  
     console.log("----Final Data---> ",serviceId,apiUrl,qpString,payloadString);
     //serviceSubmit(fd,qpString,payloadString);
     singleService(fd,qpString,payloadString);
    })
  
  }







export function submitForm(form) {
  console.log("====Submit Form====",form.href);  
  getServices(form.href);
}




function singleService(fd,qpString,payloadString){
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "text/plain");
  myHeaders.append("Access-Control-Allow-Origin","*");
  myHeaders.append("User-Agent", "PostmanRuntime/7.35.0");
  myHeaders.append("Accept", "*/*");
  myHeaders.append("Postman-Token", "4c08245e-0f54-4bf8-b505-67f9a63dfaa8");
  myHeaders.append("Host", "web-takeda-uat.epsilon.com");
  myHeaders.append("Accept-Encoding", "gzip, deflate, br");
  myHeaders.append("allowedOrigins","*");
  myHeaders.append("crossDomain","true");
  myHeaders.append('Content-Type','application/json')



var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: payloadString,
  redirect: 'follow'
};

fetch(fd.Url+qpString, requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
}




function serviceSubmit(fd,qpString,payloadString){
    var settings = {
        "url": fd.Url+qpString,
        "method": "POST",
        "timeout": 0,
        "processData": false,
        "mimeType": "multipart/form-data",
        "contentType": false,
        "data": payloadString
      };
      $.ajax(settings).done(function (data,textStatus) {
        //const sympResp=JSON.parse(data);
          console.log("API Response",JSON.parse(data));
        });
}