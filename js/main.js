var chart, divGrafico;
var solucao = ["ODE"];

//VALORES QUE SERÃO INPUTS DO USUARIO
var T_escala = 1;
var dt = 100;
var tempoSimulacao = 10000;
//FIM

//VALORES PARA FAZER O CALCULO DO ODE45
var A, B, C, x0, n;
var u_tend = [], y_tend = [], t_tend = []; 
//FIM

var date = new Date();
var tempoAtual = date.getTime();
var tempoAlvo = tempoAtual + dt;

var taxaRelogio = 2000;

var socket = io.connect("http://localhost:2003");
socket.on('connect', function(){
	console.log("Conectado!");
	socket.on("respostaValoresIniciais", function(a, b, c, x0, valorN){
		A = JSON.parse(a);
		B = JSON.parse(b);
		C = JSON.parse(c);
		x0 = JSON.parse(x0);
		n = valorN;
	});
	socket.on("respostaValorODE", function(msg){

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
}

setInterval(function relogio(){
	tempoAtual = new Date().getTime();
	if(tempoAtual >= tempoAlvo){
		tempoAlvo += dt;
		valorOde();
	}
}, taxaRelogio);

function calculoODE45(){
	//Devo enviar: t=(tempoAlvo, T_escala, ultimoValorT_tend), x?, u_atual, A, B, x0, C, t_tend, u_tend, y_tend;
	//concatena os valores obtidos em t_tend, y_tend, u_tend
	//Pega o ultimo valor de x em [x, t], que é o valor do calculo do último ins
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