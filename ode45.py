import numpy as np
import matplotlib.pylab as plt
from scipy import signal
import json

import socketio
import eventlet
import eventlet.wsgi
import flask
from flask import Flask, render_template

sio = socketio.Server()
app = Flask(__name__)

@app.route('/')
def index():
    """Serve the client-side application."""
    return render_template('index.html')

@sio.on('connect', namespace='/chat')
def connect(sid, environ):
    print("Conectou: ", sid)

@sio.on('disconnect', namespace='/chat')
def disconnect(sid):
    print('Desconectou: ', sid)

@sio.on('teste')
def valoresIniciais(sid, num, den):
	calculoValoresIniciais(num, den)

def teste2():
	print()
	#a = np.identity(5);
	#obj = json.dumps(a.tolist())
	#sio.emit('respostaTeste', data=(obj))

def ode45_step(f, x, t, dt, *args):
    """
    One step of 4th Order Runge-Kutta method
    """
    k = dt
    k1 = k * f(t, x, *args)
    k2 = k * f(t + 0.5*k, x + 0.5*k1, *args)
    k3 = k * f(t + 0.5*k, x + 0.5*k2, *args)
    k4 = k * f(t + dt, x + k3, *args)
    return x + 1/6 * (k1 + 2*k2 + 2*k3 + k4)

def ode45(f, t, x0, *args):
    """
    4th Order Runge-Kutta method
    """
    n = len(t)
    x = np.zeros((n, len(x0)))
    print(len(x))
    x[0] = x0
    for i in range(n-1):
        dt = t[i+1] - t[i] 
        x[i+1] = ode45_step(f, x[i], t[i], dt, *args)
    return x

def f(t, x, u, a, b):
    """
    Pendulum example function.
    """
    dydt = [omega, -b*omega - c*np.sin(theta)]
    return np.array(dydt)

def calculoValoresIniciais(NumString, DenString):

	Num = np.asarray(json.loads(NumString))
	Den = np.asarray(json.loads(DenString))

	Num = Num/Den[0]
	Den = Den/Den[0]

	na = np.size(Den)
	nb = np.size(Num)

	#FAZER O END AQUI if(nb < na - 1) 

	n = np.size(Den) - 1
	a1 = np.zeros((n,1))
	a2 = np.identity(n)
	a3 = np.delete(a2, n-1, 1)
	A = np.concatenate((a1, a3), 1)
	A = np.delete(A, n-1, 0)
	a4 = np.delete(Den, 0)
	a4 = -a4[::-1]
	a4 = np.asmatrix(a4)
	A = np.concatenate((A, a4), 0)
	B = np.zeros((n-1, 1))
	b1 = [[1]]
	B = np.concatenate((B, b1), 0)
	C = Num[::-1]
	x0 = np.zeros((1,n))

	print(json.dumps(A.tolist()))
	#Enviar de volta A, B, C, x0, n

	sio.emit('respostaValoresIniciais', data=(json.dumps(A.tolist()), json.dumps(B.tolist()), json.dumps(C.tolist()), json.dumps(x0.tolist()), n))

#plt.plot(x)
#plt.show()
    
if __name__ == '__main__':
    app = socketio.Middleware(sio, app)
    eventlet.wsgi.server(eventlet.listen(('', 2003)), app)