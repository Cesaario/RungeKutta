var chart, divGrafico;
var solucao = ["ODE"];

//VALORES QUE SERÃO INPUTS DO USUARIO
var T_escala = 1;
var dt = 100;
var tempoSimulacao = 10000;
//FIM

var date = new Date();
var t0 = date.getTime();
var tempoAtual = date.getTime() - t0;
var tempoAlvo = tempoAtual + dt;

var taxaRelogio = 50;

//VALORES PARA FAZER O CALCULO DO ODE45
var A, B, C, x0, n;
var u_tend = [0], y_tend = [0], t_tend = [tempoAtual/1000]; 
var t = [], x = [];
//FIM

var socket = io.connect("http://localhost:2003");
socket.on('connect', function(){
	console.log("Conectado!");
	socket.on("respostaValoresIniciais", function(a, b, c, x0S, valorN){
		A = JSON.parse(a);
		B = JSON.parse(b);
		C = JSON.parse(c);
		x0 = JSON.parse(x0S);
		n = valorN;
	});
	socket.on("respostaCalculoODE", function(tS, t_tendS, u_tendS, y_tendS, x0S){
		t = JSON.parse(tS);
		t_tend = JSON.parse(t_tendS);
		u_tend = JSON.parse(u_tendS);
		y_tend = JSON.parse(y_tendS);
		x0 = JSON.parse(x0S);
		console.log(y_tend);
		solucao = y_tend;
		solucao[0] = "ODE";
	});
});

function setup(){
    createCanvas(1024,600);
    background(200);

    //slider = createSlider(0,100,0);
    //slider.position(50,550);
    //slider.style('width', '200px');
	
	divGrafico = createDiv("");
    divGrafico.position(50,10);
    divGrafico.id("grafico");

    gerarGrafico();

    noLoop();
    divGrafico.style('position:absolute');

    var num = [1, 2];
    var dem = [1, 2.7, 4.4, 4.7, 2];
    socket.emit('valoresIniciais', JSON.stringify(num), JSON.stringify(dem));
}

setInterval(function relogio(){
	tempoAtual = new Date().getTime() - t0;
	if(tempoAtual >= tempoAlvo){
		tempoAlvo += dt;
		calculoODE45();
		atualizaGrafico();
	}
}, taxaRelogio);

function calculoODE45(){
	//Devo enviar: t=(tempoAlvo, T_escala, UltimoValorT_tend), x?, u_atual, A, B, x0, C, t_tend, u_tend, y_tend;
	//concatena os valores obtidos em t_tend, y_tend, u_tend
	//Pega o ultimo valor de x em [x, t], que é o valor do calculo do último ins

	//Devo retornar: t, t_tend, u_tend, y_tend
	//NÃO PRECISO ENVIAR O T ???
	console.log(x0);
	socket.emit('calculoODE', tempoAtual/1000, tempoAlvo/1000, T_escala, JSON.stringify(t), JSON.stringify(x), JSON.stringify(A), JSON.stringify(B),
	 						JSON.stringify(C), JSON.stringify(x0), JSON.stringify(t_tend), JSON.stringify(u_tend), JSON.stringify(y_tend));
}

function gerarGrafico(){
	chart = c3.generate({
		bindto: '#grafico',
        size: {
            height: 250,
            width: 700
        },
		data:{
            columns: [
                solucao
            ]
		},
	    transition: {
	        duration: 0
	    },
        axis: {
            x: {
                show: false // this needed to load string x value
            },
            /*y: {
	            max: 5,
	            min: 0
        	}*/
        },
        point: {
            show: false
        }
	});
	console.log("Grafico gerado!");
}

function atualizaGrafico(){
	chart.load({
		columns:[
			solucao
		]
	});
}

//TODO: Arrumar uma função ode45 para python que funcione. Ou conseguir fazer a RK45 funcionar.