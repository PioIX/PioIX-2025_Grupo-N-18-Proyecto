/*******************************************************************
	 * 
	 * Clase Partida
	 * 
	 *******************************************************************
	*/
	
	function Partida () {
		this.equipoPrimero = {
			jugador: {},
			puntos: 0,
			esMano: false,
			manos: 0,
			esSuTurno: true
		};
		this.equipoSegundo = {
			jugador: {},
			puntos: 0,
			esMano: true,
			manos: 0,
			esSuTurno: false
		};
	}
	//------------------------------------------------------------------
	// Inicia la partida
	//------------------------------------------------------------------
	
	Partida.prototype.iniciar = function (nombreJugadorUno, nombreJugadorDos) {
		var jugador1 = new Jugador();
		if(nombreJugadorUno !== null && nombreJugadorUno !== undefined && nombreJugadorUno !== '') {
			jugador1.nombre = nombreJugadorUno;
		} else {
			jugador1.nombre = 'Jugador 1';
		}
		this.equipoPrimero.jugador = jugador1;
		var maquina = new IA();
		maquina.prob = new Probabilidad();
		//maquina.esHumano = false;
		if(nombreJugadorDos !== null && nombreJugadorDos !== undefined && nombreJugadorDos !== '') {
			maquina.nombre = nombreJugadorDos;
		} else {
			maquina.nombre = 'Maquina';
		}
		this.equipoSegundo.jugador = maquina;
		
		var _$tbl = $('#game-score');
		_$tbl.find('.player-one-name').html(jugador1.nombre);
		_$tbl.find('.player-two-name').html(maquina.nombre);
		_$tbl.find('.player-one-points').html('');
		_$tbl.find('.player-two-points').html('');
		$('#player-two').find('.player-name').html(maquina.nombre);
		$('#player-one').find('.player-name').html(jugador1.nombre);
		
		this.continuar();
	}
	//------------------------------------------------------------------
	// Continua la partida, una nueva ronda
	//------------------------------------------------------------------
	
	Partida.prototype.continuar = function () {
		limitePuntaje = parseInt($('.rbd-ptos-partida:checked').val(), 10);
	    while (this.equipoPrimero.puntos < limitePuntaje && this.equipoSegundo.puntos < limitePuntaje) {
			var _$tbl = $('#game-score');
			_log.innerHTML =  "";
			_$tbl.find('.player-one-points').html(this.equipoPrimero.puntos);
			_$tbl.find('.player-two-points').html(this.equipoSegundo.puntos);
			_log.innerHTML = '<hr />' + '<br /> Puntaje parcial : ' + this.equipoPrimero.jugador.nombre + ' ' + this.equipoPrimero.puntos + ' - '+ this.equipoSegundo.jugador.nombre + ' ' + this.equipoSegundo.puntos + '<br /> ' + '<hr />' + _log.innerHTML ;
			if(this.equipoSegundo.esMano) {
				this.equipoSegundo.esMano = false;
				this.equipoPrimero.esMano = true;
			} else {
				this.equipoSegundo.esMano = true;
				this.equipoPrimero.esMano = false;
			}
			if (Debug)
				$('#player-one').find('.player-name').html("Envido: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.envidoS) +  " - " +
 			    "EE: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.revire) +  " - "  + 
		    	"RE: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.realEnvido) +  " - " +
	            "TODO: " + this.equipoSegundo.jugador.prob.promedioPuntos(this.equipoSegundo.jugador.realEnvido.concat(this.equipoSegundo.jugador.revire,this.equipoSegundo.jugador.envidoS))  
			  );
				
            var ronda = new Ronda(this.equipoPrimero, this.equipoSegundo);
			ronda.iniciar();
			if(ronda.enEspera) {
				break;
			}
			
		}
		if((this.equipoPrimero.puntos >= limitePuntaje || this.equipoSegundo.puntos >= limitePuntaje)) {
			swal({
				title: "Juego terminado",
				icon: "success",
				button: "Ok!",
			  });
		    _log.innerHTML = '<hr />' + '<br /> PUNTAJE FINAL : ' + this.equipoPrimero.jugador.nombre + ' ' + this.equipoPrimero.puntos + ' - '+ this.equipoSegundo.jugador.nombre + ' ' + this.equipoSegundo.puntos + _log.innerHTML ;
		}
	}
	
	$(document).ready(function () {
		audio = new Sonido($('#cbxAudio').get(0));
		//Cargo recursos
		var a = new Audio();
		a.setAttribute("src","audio/envido.wav");
		a.load();
		audio.fx['E'] = a;
		a = new Audio();
		a.setAttribute("src","audio/real-envido.wav");
		a.load();
		audio.fx['R'] = a;
		a = new Audio();
		a.setAttribute("src","audio/falta-envido.wav");
		a.load();
		audio.fx['F'] = a;
		a = new Audio();
		a.setAttribute("src","audio/quiero.wav");
		a.load();
		audio.fx['S'] = a;
		a = new Audio();
		a.setAttribute("src","audio/no-quiero.wav");
		a.load();
		audio.fx['N'] = a;
		a = new Audio();
		a.setAttribute("src","audio/truco.wav");
		a.load();
		audio.fx['T'] = a;
		a = new Audio();
		a.setAttribute("src","audio/re-truco.wav");
		a.load();
		audio.fx['RT'] = a;
		a = new Audio();
		a.setAttribute("src","audio/vale-cuatro.wav");
		a.load();
		audio.fx['V'] = a;
		//Comienza la acción
		_partidaActual = new Partida();
		_partidaActual.iniciar('Jugador 1', 'Computadora');

		var _inputsName = $('.human-name');
		var _nAnterior = '';
		var _nNuevo = '';
		var _estabaEditando = false;
		_inputsName.keydown(function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
			}
		});
		_inputsName.keyup(function(event) {
			if (event.keyCode !== 13) {
				var name = $(this).html();
				var _other = _inputsName.not(this);
				if(!_estabaEditando) {
					_nAnterior = _other.html();
					_estabaEditando = true;
				}
				_other.html(name);
				_nNuevo = _partidaActual.equipoPrimero.jugador.nombre = name;
			} else {
				event.preventDefault();
			}
		});
		_inputsName.blur(function() {
			_log.innerHTML = "<br />" + _nAnterior + " cambia su nombre a: " + _nNuevo + _log.innerHTML ;
			_estabaEditando = false;
		});

		$('#cbxDebug').change(function () {
			Debug = $(this).is(':checked');
		}).attr('checked',false);
		
		var _cajasCollapsables = $('.box--collapsable');
		if(_cajasCollapsables.length > 0) {
			_cajasCollapsables.find('.box-content').addClass('box-content--hidden');
			_cajasCollapsables.find('.box-title').addClass('box-title--hidden').click(function(){
				var _title = $(this);
				if(_title.hasClass('box-title--hidden')) {
					_title.removeClass('box-title--hidden').children('img').addClass('title-rotate');
					_title.parent().children('.box-content--hidden').removeClass('box-content--hidden');
				} else {
					_title.addClass('box-title--hidden').children('img').removeClass('title-rotate');
					_title.parent().children('.box-content').addClass('box-content--hidden');
				}
			});
		}
	});