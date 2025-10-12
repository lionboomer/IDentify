from notebook.auth import passwd
c.NotebookApp.password = passwd("dein_passwort")
c.NotebookApp.token = 'dein_sicheres_token'
c.NotebookApp.open_browser = False
c.NotebookApp.ip = '0.0.0.0'
c.NotebookApp.port = 8888