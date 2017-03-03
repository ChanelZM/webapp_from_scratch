/*jslint browser: true, devel: true, eqeq: true, plusplus: true, sloppy: true, vars: true, white: true*/

(function () {
    //Execute code in strict mode
    'use strict';
    
    //Later on this variable will contain all the questions of every category
    var rolledUpData = [],
        categories = [];
    
    //Select elements in DOM and store them in variable elements
    var elements = {
        landingPage : document.getElementById('start'),
        quiz : document.getElementById('categories'),
        categoryList : document.querySelector('#categorylist'),
        titleInput : document.querySelector('input[name="title"]'),
        generateQuizButton : document.querySelector('button[type="submit"]'),
        quizGenerator : document.querySelector('#quizgenerator'),
        allQuestions : document.querySelector('.allquestions'),
        givenTitle : document.querySelector('.mytitle'),
        questionPanel : document.querySelector('.questionpanel'),
        questionSection : document.querySelector('.questionsection'),
        filterOptions : document.querySelector('.filteroptions')
    };
    
    //Store API calls in variable questions.
    var get = {
        data: function(){
            var fills = [
                {name: 'tv',
                 number: 14},
                {name: 'scienceNature',
                 number: 17},
                {name: 'history',
                 number: 23},
                {name: 'music',
                 number: 12}
            ]; 
            
            fills.forEach(function(obj){
                aja()
                .method('get')
                //API from https://opentdb.com/api_config.php
                .url('https://opentdb.com/api.php?amount=20&category=' + obj.number + '&difficulty=easy&type=multiple')
                .type('json')
                .on('200', function(response){ //If the API is succesful, store the data in tv
                    localStorage.setItem(obj.name, JSON.stringify(response)); //Source 1, put the data into local storage
                    map.data(obj.name);
                })
                .go();
            }); 
        }
 };
    
    var map = {
        data : function(data){
            var parsedData = JSON.parse(localStorage.getItem(data));
            var mappedData = parsedData.results.map(function(val){
                //Return an array with the question, incorrect answers and correct answer.
                return [
                    val.question,
                    val.incorrect_answers[0],
                    val.incorrect_answers[1],
                    val.incorrect_answers[2],
                    val.correct_answer,
                    val.category.replace(' ', '-')//Remove possible spaces
                ];
            });
            
            //Without forEach, rolledUpData will be arrays in arrays in an array. With forEach just all arrays in one array
            mappedData.forEach(function(item){
                rolledUpData.push(item);  
            });
        }
    };
    
    //Settings for starting app.
    var app = {
        init: function(){
            routes.init();
        }
    };
    
    //After initiation, var routes handles the routes of the SPA
    var routes = {
        init: function(){ 
            //On load show the home page
            location.hash = '#home';
            //Load data
            get.data();

            routie({
                'home': function() {
                    //Execute toggle
                    sections.toggle('home');
                },
                'categories': function(){
                    //Hide all other elements except categoryList
                    elements.categoryList.hidden = false;
                    elements.questionPanel.hidden = true;
                    
                    //Render the available categories and toggle the sections
                    sections.toggle('categories');
                    sections.render(rolledUpData, 'local');
                },
                'quizgenerator': function(){
                    //Show the title that the user gave.
                    elements.givenTitle.innerHTML = elements.titleInput.value;
                    
                    sections.toggle('quizgenerator');
                    sections.render(rolledUpData, 'local');
                },
                'categories/:name': function(name) {
                    elements.categoryList.hidden = true;
                    elements.questionPanel.hidden = false;
                    
                    var selectedCategory = rolledUpData.filter(function(val){
                        return val[5] == name;
                    });
                
                    sections.render(selectedCategory, 'local');
                },
                'errorpage': function(){
                    elements.navigation.hidden = true;
                    sections.toggle('error');
                }
            });
        }
    };
    
    var sections = {
        render: function(data, source) {      
            //Use the data parameter to fill the elements in the section. Loop through all the data and add elements for them too.
            var directives = {
                question : {
                    text: function(){
                        return this[0];
                    },
                    class: function(){
                        return 'question ' + this[5];
                    }
                },
                answers : {
                    class: function(){
                        return 'answers ' + this[5];
                    }
                },
                answer1 : {
                    text : function(){
                        return this[1];
                    }
                },
                answer2 : {
                    text : function(){
                        return this[2];
                    }
                },
                answer3 : {
                    text : function(){
                        return this[3];
                    }
                },
                correctanswer : {
                    text : function(){
                        return this[4];
                    }
                }
            };
            
            var categoryDirectives = {
                category : {
                    href: function(){
                        return '#categories/' + this.value;
                    },
                    text : function(){
                        return this.value.replace('-', ' ');
                    }
                }
            };
            
            //Create checkboxes and labels for every category
            var values = {
                filtercategory : {
                    value: function(){
                        return this.value;
                    },
                    id: function(){
                        return this.value;
                    }
                },
                label : {
                    text: function(){
                        return this.value.replace('-', ' ');
                    },
                    for: function(){
                        return this.value;
                    }
                }
            };
            
            Transparency.render(elements.questionPanel, data, directives); 
            Transparency.render(elements.questionSection, data, directives);
            Transparency.render(elements.filterOptions, categories, values);
            Transparency.render(elements.categoryList, categories, categoryDirectives);
            
            //Filter through the data everytime the user clicks on a checkboxs
            elements.filterOptions.addEventListener('click', function(){
                //Creates object with checkbox values and if they are checked.
                var filterValues = {
                    'Entertainment:-Television' : document.querySelector('input[value="' + categories[0] + '"]').checked,
                    'Science-& Nature' : document.querySelector('input[value="' + categories[1] + '"]').checked,
                    'History' : document.querySelector('input[value="' + categories[2] + '"]').checked,
                    'Entertainment:-Music' : document.querySelector('input[value="' + categories[3] + '"]').checked
                };
                
                function categorySelection(dataArray){
                    return filterValues[dataArray[5]];
                }
                
                var filteredData = rolledUpData.filter(categorySelection);
                
                sections.render(filteredData, 'local');
            });
            
            sections.selectQuestions();
        }, 
        toggle: function(route){
            //Change all the other sections to hidden, except the active tab. Source: Shyanta Vleugel
            var currentSection = document.querySelector('#' + route),
                unactiveSections = document.querySelectorAll('body > section:not(#' + route + ')');
            
            unactiveSections.forEach(function(unactiveSections){
                unactiveSections.hidden = true;
                currentSection.hidden = false;
            });
        },
        selectQuestions: function(){
            //User can select questions for their own quiz
            var question = document.querySelectorAll('.questionsection .question');
            
            question.forEach(function(element){
                element.addEventListener('click', function(){
                    if(element.className !== 'question selected'){
                        element.className += ' selected';
                    } else {
                        element.classList.remove('selected');
                    }
                });
            });
        }
    };
    
    //Initiate app
    app.init();
    
})();

//Sources:
//1 : Stackoverflow. (2010). Storing Objects in HTML5 localStorage. Source:
//http://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage
//2 : Stackoverflow. (2014). Remove Duplicate item from array Javascript [duplicate]. Source:
//http://stackoverflow.com/questions/18008025/remove-duplicate-item-from-array-javascript