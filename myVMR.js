const xapi = require('xapi');

// Variable init

var data = {'callId': '', 
            'destination':'',
            'user' :'',
            'domain':'',
            'vmrNumber':'',
            'vmrPin':''
};


var splitted_URI;
var splitted_host;
var isVMRcall = false
var VMRregex = /7\d{10}$/;

console.log('MyVMR script starting');

// Listen for outgoing calls

xapi.event.on('OutgoingCallIndication', Main);

function Main(current_call) {

 data['callId']  = current_call.CallId;
 console.log('callId =', data['callId']);
 xapi.status.get('Call', {'CallId': data['callId']}).then(getCallInfo);
}

function getCallInfo(my_call_info) {
  
 data['destination'] = my_call_info[0].RemoteNumber;
 console.log('Destination Number =', data['destination']);
 
 if (data['destination'].indexOf('*') > -1){
   
    console.log("This call look like a VMR with PIN included")
    treatURI(data['destination']);
    console.log('User Portion is = ', data['user']);
    console.log('Domain Portion is = ', data['domain']);
    console.log('vmrNumber = ', data['vmrNumber']);
    console.log('vmrPin= ', data['vmrPin']);
    
    if (VMRregex.test(data['vmrNumber'])){
       var isVMRcall = true;
       console.log('This is definetely a VMR call with a PIN included');
       console.log('isVMRcall= ', isVMRcall);
       console.log('ending this call');
       
       //xapi.command("dial", {Number: data['vmrNumber']}).catch((error) => { console.error(error); });
       
       xapi.command("Call Disconnect", {CallId: data['callId']}).catch((error) => { console.error(error); });
       console.log('Initiating a new call to', data['vmrNumber']);
       xapi.command("dial", {Number: data['vmrNumber']}).catch((error) => { console.error(error); });
       
       sleep(5000).then(() => {
                if(data['vmrPin'].length>0){
                  xapi.command("Call DTMFSend", {DTMFString: data.vmrPin});  
                    if(!data['vmrPin'].includes('#')){
                        xapi.command("Call DTMFSend", {DTMFString: '#'});
                    }
                }
                else{
                    xapi.command("Call DTMFSend", {DTMFString: '#'});
                }
		      });		    
		    }
    }

   else{
    console.log("Standard call, myVMR macro won't touch this call")
  }
}

function treatURI(destination){
  
 splitted_URI = destination.split('@');
 data['user'] = splitted_URI[0];
 data['domain'] = splitted_URI[1];
 splitted_host = data['user'].split('*');
 data['vmrNumber'] = splitted_host[0];
 data['vmrPin'] = splitted_host[1];
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


console.log('Macro completed');
