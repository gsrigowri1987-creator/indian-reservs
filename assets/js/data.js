const RESERVOIRS = [
  {id:'stanley', name:'Stanley Reservoir', dam:'Mettur Dam', state:'Tamil Nadu', river:'Kaveri', category:'Stanley Reservoir', wiki:'Stanley Reservoir', fact:'Formed by Mettur Dam in Salem district, it stores Kaveri water for irrigation, drinking water, and power generation.'},
  {id:'krs', name:'Krishna Raja Sagara', dam:'KRS Dam', state:'Karnataka', river:'Kaveri', category:'Krishna Raja Sagara', wiki:'Krishna Raja Sagara', fact:'Built across the Kaveri near Mysuru and Mandya, it is closely associated with the Brindavan Gardens.'},
  {id:'idukki', name:'Idukki Reservoir', dam:'Idukki Dam', state:'Kerala', river:'Periyar', category:'Idukki Dam', wiki:'Idukki Dam', fact:'The dam sits between two mountain peaks and is one of the tallest arch dams in Asia.'},
  {id:'nagarjuna', name:'Nagarjuna Sagar', dam:'Nagarjuna Sagar Dam', state:'Telangana / Andhra Pradesh', river:'Krishna', category:'Nagarjuna Sagar Dam', wiki:'Nagarjuna Sagar Dam', fact:'This major masonry dam on the Krishna straddles Telangana and Andhra Pradesh and supports irrigation and power generation.'},
  {id:'srisailam', name:'Srisailam Reservoir', dam:'Srisailam Dam', state:'Andhra Pradesh / Telangana', river:'Krishna', category:'Srisailam Dam', wiki:'Srisailam Dam', fact:'Set in the Nallamala Hills on the Krishna, it is an important hydropower and irrigation reservoir.'},
  {id:'tungabhadra', name:'Tungabhadra Reservoir', dam:'Tungabhadra Dam', state:'Karnataka', river:'Tungabhadra', category:'Tungabhadra Dam', wiki:'Tungabhadra Dam', fact:'Also called Pampa Sagar, it stores Tungabhadra water near Hosapete and supports irrigation in Karnataka and Andhra Pradesh.'},
  {id:'bhavanisagar', name:'Bhavanisagar Reservoir', dam:'Bhavanisagar Dam', state:'Tamil Nadu', river:'Bhavani', category:'Bhavanisagar Dam', wiki:'Bhavanisagar Dam', fact:'Also known as Lower Bhavani Dam, it is a major earthen dam in Erode district on the Bhavani River.'},
  {id:'vaigai', name:'Vaigai Reservoir', dam:'Vaigai Dam', state:'Tamil Nadu', river:'Vaigai', category:'Vaigai Dam', wiki:'Vaigai Dam', fact:'Built near Andipatti in Theni district, it supplies irrigation water and drinking water to cities including Madurai.'},
  {id:'mullaperiyar', name:'Mullaperiyar Reservoir', dam:'Mullaperiyar Dam', state:'Kerala / Tamil Nadu', river:'Periyar', category:'Mullaperiyar Dam', wiki:'Mullaperiyar Dam', fact:'Located in Kerala and operated by Tamil Nadu, it diverts Periyar water eastward for irrigation and power use.'},
  {id:'kabini', name:'Kabini Reservoir', dam:'Kabini Dam', state:'Karnataka', river:'Kabini', category:'Kabini dam', wiki:'Kabini dam', fact:'Built on the Kabini River in Mysuru district, it supports irrigation, drinking water supply, and power generation.'},
  {id:'banasura', name:'Banasura Sagar', dam:'Banasura Sagar Dam', state:'Kerala', river:'Karamanthodu', category:'Banasura Sagar Dam', wiki:'Banasura Sagar Dam', fact:'This earth-fill dam in Wayanad impounds Karamanthodu, a tributary of the Kabini River.'},
  {id:'almatti', name:'Almatti Reservoir', dam:'Almatti Dam', state:'Karnataka', river:'Krishna', category:'Almatti Dam', wiki:'Almatti Dam', fact:'Part of the Upper Krishna Project, this reservoir stores Krishna River water in north Karnataka.'},
  {id:'hemavathi', name:'Hemavathi Reservoir', dam:'Hemavathi Dam', state:'Karnataka', river:'Hemavathi', category:'Gorur dam', wiki:'Gorur dam', fact:'Created by Gorur Dam near Hassan, it stores Hemavathi water before the river joins the Kaveri system.'},
  {id:'malampuzha', name:'Malampuzha Reservoir', dam:'Malampuzha Dam', state:'Kerala', river:'Malampuzha', category:'Malampuzha Dam', wiki:'Malampuzha Dam', fact:'Located near Palakkad, it impounds the Malampuzha River, a tributary of the Bharathapuzha system.'},
  {id:'sathanur', name:'Sathanur Reservoir', dam:'Sathanur Dam', state:'Tamil Nadu', river:'Thenpennai', category:'Sathanur Dam', wiki:'Sathanur Dam', fact:'A popular weekend spot near Tiruvannamalai, with boating and a small crocodile farm nearby.'},
  {id:'amaravathi', name:'Amaravathi Reservoir', dam:'Amaravathi Dam', state:'Tamil Nadu', river:'Amaravathi', category:'Amaravathi Dam', wiki:'Amaravathi Dam', fact:'Located near Udumalpet, it is known for irrigation, flood control, hydropower, and nearby mugger crocodile habitat.'}
];

const RESERVOIR_IMAGES = {
  hemavathi: ['assets/images/hemavathi.png']
};

const QUIZ_QUESTIONS = [
  {q:'Which river forms the Stanley Reservoir?', options:['Kaveri','Krishna','Godavari','Periyar'], a:0, diff:'easy'},
  {q:'The KRS Dam is located in which state?', options:['Tamil Nadu','Karnataka','Kerala','Telangana'], a:1, diff:'easy'},
  {q:'Idukki Dam is built across which river?', options:['Bhavani','Periyar','Vaigai','Tungabhadra'], a:1, diff:'easy'},
  {q:'Nagarjuna Sagar Dam is one of the largest dams of which type?', options:['Earthen','Masonry','Arch','Rockfill'], a:1, diff:'medium'},
  {q:'Srisailam Dam sits inside which forest region?', options:['Nallamala forest','Nilgiri hills','Western Ghats','Anamalai hills'], a:0, diff:'medium'},
  {q:'Tungabhadra Dam is also known by which other name?', options:['Pampa Sagar','Stanley Reservoir','Banasura Sagar','Vani Vilasa Sagara'], a:0, diff:'medium'},
  {q:'Bhavanisagar Dam is built on which river?', options:['Vaigai','Bhavani','Amaravathi','Kabini'], a:1, diff:'easy'},
  {q:'Which city relies heavily on the Vaigai Dam for water?', options:['Chennai','Coimbatore','Madurai','Salem'], a:2, diff:'medium'},
  {q:'Mullaperiyar Dam diverts water between which two states?', options:['Kerala and Tamil Nadu','Karnataka and Kerala','Andhra Pradesh and Telangana','Tamil Nadu and Karnataka'], a:0, diff:'medium'},
  {q:'Kabini Reservoir is especially known for attracting which animals in summer?', options:['Tigers','Elephants','Peacocks','Otters'], a:1, diff:'medium'},
  {q:'Banasura Sagar Dam is one of the largest dams of which construction type in India?', options:['Concrete','Earthen','Arch','Buttress'], a:1, diff:'hard'},
  {q:'Almatti Dam is built across which river?', options:['Krishna','Kaveri','Tungabhadra','Godavari'], a:0, diff:'medium'},
  {q:'Hemavathi Dam eventually feeds into which major river system?', options:['Krishna','Godavari','Kaveri','Periyar'], a:2, diff:'hard'},
  {q:'Malampuzha Dam is the largest dam in which state?', options:['Karnataka','Kerala','Tamil Nadu','Andhra Pradesh'], a:1, diff:'easy'},
  {q:'Sathanur Dam is built across which river?', options:['Thenpennai','Bhavani','Vaigai','Amaravathi'], a:0, diff:'hard'},
  {q:'Amaravathi Dam feeds a zoological park famous for which animal?', options:['Lions','Crocodiles','Elephants','Tigers'], a:1, diff:'hard'},
  {q:"Which reservoir's dam was engineered by Sir M. Visvesvaraya?", options:['Mettur Dam','KRS Dam','Idukki Dam','Nagarjuna Sagar'], a:1, diff:'medium'},
  {q:'The Mettur Dam was completed in which decade?', options:['1900s','1930s','1950s','1970s'], a:1, diff:'hard'},
  {q:'Which of these reservoirs is in Andhra Pradesh?', options:['Idukki','Srisailam','Banasura Sagar','Hemavathi'], a:1, diff:'easy'},
  {q:'Which of these reservoirs is in Kerala?', options:['Tungabhadra','Almatti','Malampuzha','Sathanur'], a:2, diff:'easy'},
  {q:'Brindavan Gardens is attached to which reservoir?', options:['Stanley Reservoir','Krishna Raja Sagara','Idukki Reservoir','Kabini Reservoir'], a:1, diff:'easy'},
  {q:'Which river connects both Almatti and Nagarjuna Sagar reservoirs?', options:['Kaveri','Periyar','Krishna','Tungabhadra'], a:2, diff:'hard'},
  {q:'Vaigai Dam has a park famous for which feature?', options:['Rock garden','Musical fountain','Butterfly park','Boat museum'], a:1, diff:'medium'},
  {q:'Banasura Sagar Dam is named after a character from which source?', options:['A Bollywood film','Local legend / mythology','A colonial engineer','A freedom fighter'], a:1, diff:'medium'}
];

const GAMES = [
  {id:'quiz', name:'Reservoir Quiz', icon:'🧠', cat:'quiz', diff:'Medium', time:'5 min', desc:'Multiple choice questions on reservoirs, rivers and states.', route:'game-quiz'},
  {id:'guess', name:'Guess the Reservoir', icon:'🔍', cat:'quiz', diff:'Medium', time:'4 min', desc:'A blurred photo, hints, and a race to guess right.', route:'game-guess'},
  {id:'memory', name:'Memory Match', icon:'🎴', cat:'puzzle', diff:'Easy', time:'3 min', desc:'Flip cards to match each reservoir with its river.', route:'game-memory'},
  {id:'jigsaw', name:'Jigsaw Puzzle', icon:'🧩', cat:'puzzle', diff:'Medium', time:'4 min', desc:'Rebuild a real reservoir photo, tile by tile.', route:'game-jigsaw'},
  {id:'wheel', name:'Spin the Wheel', icon:'🎡', cat:'challenge', diff:'Easy', time:'2 min', desc:'Spin for a random trivia question or bonus coins.', route:'game-wheel'},
  {id:'challenge30', name:'30 Second Challenge', icon:'⚡', cat:'challenge', diff:'Hard', time:'30 sec', desc:'Answer as many rapid-fire questions as you can.', route:'game-challenge30'},
  {id:'wordsearch', name:'Word Search', icon:'🔤', cat:'puzzle', diff:'Medium', time:'4 min', desc:'Find reservoir names hidden inside a letter grid.', route:'game-wordsearch'},
  {id:'snake', name:'Reservoir Snake', icon:'🐍', cat:'challenge', diff:'Hard', time:'30 sec', desc:'Eat water drops to unlock historical reservoir facts.', route:'game-snake'},
  {id:'typing', name:'Reservoir Typist', icon:'⌨️', cat:'challenge', diff:'Hard', time:'30 sec', desc:'Type reservoir names under pressure as fast as you can.', route:'game-typing'}
];
