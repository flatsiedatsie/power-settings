(function() {
  class PowerSettings extends window.Extension {
    constructor() {
      super('power-settings');
      this.addMenuEntry('Power settings');

      this.content = '';
      fetch(`/extensions/${this.id}/views/content.html`)
        .then((res) => res.text())
        .then((text) => {
          this.content = text;
        })
        .catch((e) => console.error('Failed to fetch content:', e));
    }

    show() {
      this.view.innerHTML = this.content;


      const hours =
        document.getElementById('extension-power-settings-form-hours');
      const minutes =
        document.getElementById('extension-power-settings-form-minutes');
      const ntp =
        document.getElementById('extension-power-settings-form-ntp');
      const submit =
        document.getElementById('extension-power-settings-form-submit');
			const browser_time_button =
        document.getElementById('extension-power-settings-form-browser-time-button');
			const fullsceen_button =
        document.getElementById('extension-power-settings-fullscreen-button');
				
      const pre =
        document.getElementById('extension-power-settings-response-data');
			const content = 
				document.getElementById('extension-power-settings-content');

      const shutdown =
        document.getElementById('extension-power-settings-shutdown');
      const reboot =
        document.getElementById('extension-power-settings-reboot');

			pre.innerText = "";

      ntp.addEventListener('click', () => {				
				var ntp_current_state = 0;
				if(ntp.checked){
					ntp_current_state = 1;
				}
        window.API.postJson(
          `/extensions/${this.id}/api/set-ntp`,
          {'ntp': ntp_current_state}
        ).then((body) => {
          pre.innerText = JSON.stringify(body, null, 2);
        }).catch((e) => {
          pre.innerText = e.toString();
        });
      });


      submit.addEventListener('click', () => {
				if( hours.value.trim() != '' && minutes.value.trim() != ''){ // Make sure the user inputted something. Python will also sanitize.
	        window.API.postJson(
	          `/extensions/${this.id}/api/set-time`,
	          {'hours': hours.value, 'minutes': minutes.value}
	        ).then((body) => {
	          pre.innerText = JSON.stringify(body, null, 2);
	        }).catch((e) => {
	          pre.innerText = e.toString();
	        });
				}
      });
			
			
			fullsceen_button.addEventListener('click', () => {
			  
				var elem = document.documentElement;
			  if (!document.fullscreenElement && !document.mozFullScreenElement &&
			    !document.webkitFullscreenElement && !document.msFullscreenElement) {
			    if (elem.requestFullscreen) {
			      elem.requestFullscreen();
			    } else if (elem.msRequestFullscreen) {
			      elem.msRequestFullscreen();
			    } else if (elem.mozRequestFullScreen) {
			      elem.mozRequestFullScreen();
			    } else if (elem.webkitRequestFullscreen) {
			      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			    }
			  } else {
			    if (document.exitFullscreen) {
			      document.exitFullscreen();
			    } else if (document.msExitFullscreen) {
			      document.msExitFullscreen();
			    } else if (document.mozCancelFullScreen) {
			      document.mozCancelFullScreen();
			    } else if (document.webkitExitFullscreen) {
			      document.webkitExitFullscreen();
			    }
			  }
				
			});	
			
      shutdown.addEventListener('click', () => {
				content.innerHTML = "<h2>Shutting down...</h2>";
        window.API.postJson(
          `/extensions/${this.id}/api/shutdown`,
          {}
        )
      });			
			
			
      reboot.addEventListener('click', () => {
        content.innerHTML = '<h2>Rebooting...</h2><p>This page will reload automatically in 20 second. Or <a href="/" style="color:white">click here</a> to try now.</p>';
				window.API.postJson('/settings/system/actions', {action: 'restartSystem'}).catch(console.error);
				
				var getUrl = window.location;
				var baseUrl = getUrl .protocol + "//" + getUrl.host + "/things";
				
				setTimeout(function(){ 
				
					//location.replace(baseUrl);
					window.location.href = baseUrl;
				
				}, 20000);
				//window.API.postJson(
        //  `/extensions/${this.id}/api/reboot`,
        //  {}
				//)
      });
			
			
      browser_time_button.addEventListener('click', () => {
				var powerSettingsCurrentTime = new Date();
				//var powerSettingsTime = powerSettingsCurrentTime.getTime();
				//powerSettingsCurrentTime.setTime( powerSettingsCurrentTime.getTime() + new Date().getTimezoneOffset()*60*1000 );
				//console.log(powerSettingsCurrentTime);
				hours.value = powerSettingsCurrentTime.getHours();
				minutes.value = powerSettingsCurrentTime.getMinutes();
      });

			
			//console.log("Initing power settings");
			//console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
			// Get the server time
      window.API.postJson(
        `/extensions/${this.id}/api/init`,
        {'init':1}
      ).then((body) => {
				hours.placeholder = body['hours'];
				minutes.placeholder = body['minutes'];
				ntp.checked = body['ntp'];
      }).catch((e) => {
        pre.innerText = e.toString();
      });
			
    }
  }

  new PowerSettings();

	
})();


