
// Copyright 2023 Appulsion Inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Delays a request when delay in latency is imminent (due to starlink handover ro reconf) is detected.

  needsDelay=true;

  const HEARTBEAT = 15 * 1000;
  let webSocket = null;

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      //console.log("Delaying request: " + details.url);
      if (webSocket) {
        disconnect();
      } else {
        connect();
        keepAlive();
      }
      //return {cancel: false};},

        if(needsDelay){
            // log the delayed request 
            console.log("Delaying request: " + details.url);
            // wait for 2 secs
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                    needsDelay=false;
                }, 1000);
            });
        }
    },
    {urls: ["<all_urls>"]}
);

function connect() {
    webSocket = new WebSocket('ws://localhost:8080');
  
    webSocket.onopen = (event) => {
      chrome.action.setIcon({ path: 'icons/socket-active.png' });
    };
  
    webSocket.onmessage = (event) => {
      console.log(event.data);
    };
  
    webSocket.onclose = (event) => {
      chrome.action.setIcon({ path: 'icons/socket-inactive.png' });
      console.log('websocket connection closed');
      webSocket = null;
      needsDelay=true;
    };
  }


function disconnect() {
    if (webSocket) {
      webSocket.close();
    }
  }

function keepAlive() {
    const keepAliveIntervalId = setInterval(
      () => {
        if (webSocket) {
          console.log('ping');
          webSocket.send('ping');
        } else {
          clearInterval(keepAliveIntervalId);
        }
      },
      // It's important to pick an interval that's shorter than 30s, to
      // avoid that the service worker becomes inactive.
      HEARTBEAT
    );
  }