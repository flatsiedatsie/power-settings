"""Candle adapter for Mozilla WebThings Gateway."""

import os
import sys
import time
#from time import sleep
#from datetime import datetime, timedelta
import logging
import datetime
import urllib
import requests
#import string
#import urllib2
#import json
#import re
import subprocess
#from subprocess import STDOUT, check_output
#import threading
#from threading import Timer
#import serial #as ser
#import serial.tools.list_ports as prtlst
#from flask import Flask,Response, request,render_template,jsonify, url_for

#import asyncio

from gateway_addon import Adapter, Device, Database


try:
    #from gateway_addon import APIHandler, APIResponse
    from .api_handler import *
    print("PowerSettingsAPIHandler imported.")
except:
    print("Unable to load PowerSettingsAPIHandler (which is used for UX extention)")








_TIMEOUT = 3

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

_CONFIG_PATHS = [
    os.path.join(os.path.expanduser('~'), '.mozilla-iot', 'config'),
]

if 'MOZIOT_HOME' in os.environ:
    _CONFIG_PATHS.insert(0, os.path.join(os.environ['MOZIOT_HOME'], 'config'))




#
# ADAPTER
#

class PowerSettingsAdapter(Adapter):
    """Adapter for Power settings"""

    def __init__(self, verbose=True):
        """
        Initialize the object.

        verbose -- whether or not to enable verbose logging
        """
        print("initialising adapter from class")
        self.adding_via_timer = False
        self.pairing = False
        self.name = self.__class__.__name__
        self.adapter_name = 'power-settings'
        Adapter.__init__(self, self.adapter_name, self.adapter_name, verbose=verbose)
        #print("Adapter ID = " + self.get_id())
        
        print("paths:" + str(_CONFIG_PATHS))
        
        self.add_on_path = os.path.join(os.path.expanduser('~'), '.mozilla-iot', 'addons', self.adapter_name)
        print("self.add_on_path = " + str(self.add_on_path))

        self.DEBUG = True
        
        
        # Get the user's settings
        #self.add_from_config()
        
        


    def set_time(self, hours, minutes, seconds=0):
        print("Setting the new time")
        
        from datetime import datetime
        the_date = str(datetime.now().strftime('%Y-%m-%d'))
        
        time_command = "sudo date --set '" + the_date + " "  + hours + ":" + minutes + ":" + seconds + "'"
        print("new set date command: " + str(time_command))
        
        try:
            os.system(time_command) 
        except Exception as e:
            print("Error setting new time: " + str(e))


    def shutdown(self):
        print("Shutting down gateway")
        try:
            os.system('sudo shutdown now') 
        except Exception as e:
            print("Error shutting down: " + str(e))


    def reboot(self):
        print("Rebooting gateway")
        try:
            os.system('sudo reboot') 
        except Exception as e:
            print("Error rebooting: " + str(e))



    def unload(self):
        if self.DEBUG:
            print("Shutting down adapter")



def run_command(cmd, timeout_seconds=60):
    try:
        
        p = subprocess.run(cmd, timeout=timeout_seconds, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, universal_newlines=True)

        if p.returncode == 0:
            return p.stdout  + '\n' + "Command success" #.decode('utf-8')
            #yield("Command success")
        else:
            if p.stderr:
                return "Error: " + str(p.stderr)  + '\n' + "Command failed"   #.decode('utf-8'))

    except Exception as e:
        print("Error running Arduino CLI command: "  + str(e))
        

def run_command_json(cmd, timeout_seconds=60):
    try:
        
        result = subprocess.run(cmd, timeout=timeout_seconds, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, universal_newlines=True)

        if result.returncode == 0:
            return result.stdout #.decode('utf-8')
        else:
            if result.stderr:
                return "Error: " + str(result.stderr)  #.decode('utf-8'))
                #Style.error('Preprocess failed: ')
                #print(result.stderr)
        
    except Exception as e:
        print("Error running Arduino JSON CLI command: "  + str(e))
