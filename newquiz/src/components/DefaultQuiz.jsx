const defaultQuestions = {
    Physics: [
      { question: 'Speed of a boat in standing water is 9 kmph and the speed of the stream is 1.5 kmph. A man rows to a place at a distance of 105 km and comes back to the starting point. The total time taken by him is:', options: ['16 hours', '18 hours', '20 hours', '24 hours'], correctAnswer: '24 hours' },
      { question: 'What is the acceleration due to gravity on Earth?', options: ['9.8 m/s²', '8.9 m/s²', '10.2 m/s²', '7.5 m/s²'], correctAnswer: '9.8 m/s²' },
      { question: 'What is the unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correctAnswer: 'Newton' },
      { question: 'Which law states that every action has an equal and opposite reaction?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'], correctAnswer: 'Third Law' },
      { question: 'What is the speed of light in a vacuum?', options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '600,000 km/s'], correctAnswer: '300,000 km/s' },
    ],
    Chemistry: [
      { question: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Cu'], correctAnswer: 'Au' },
      { question: 'What gas, discovered on the sun before Earth, is the second most abundant element in the universe?', options: ['Hydrogen', 'Helium', 'Oxygen', 'Nitrogen'], correctAnswer: 'Helium' },
      { question: 'What is the pH of pure water?', options: ['5', '6', '7', '8'], correctAnswer: '7' },
      { question: 'Which element is a noble gas?', options: ['Oxygen', 'Neon', 'Chlorine', 'Sulfur'], correctAnswer: 'Neon' },
      { question: 'What type of bond involves the sharing of electrons?', options: ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], correctAnswer: 'Covalent' },
    ],
    Mathematics: [
      { question: 'What is the value of π (pi) to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], correctAnswer: '3.14' },
      { question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], correctAnswer: '12' },
      { question: 'What is 5! (factorial of 5)?', options: ['100', '110', '120', '130'], correctAnswer: '120' },
      { question: 'What is the sum of angles in a triangle?', options: ['90°', '180°', '270°', '360°'], correctAnswer: '180°' },
      { question: 'What is the value of 2³ + 3²?', options: ['15', '16', '17', '18'], correctAnswer: '17' },
    ],
    Biology: [
      { question: 'What is the powerhouse of the cell?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'], correctAnswer: 'Mitochondria' },
      { question: 'What gas do plants release during photosynthesis?', options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Oxygen' },
      { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Tissue'], correctAnswer: 'Cell' },
      { question: 'Which blood cells fight infections?', options: ['Red Blood Cells', 'White Blood Cells', 'Platelets', 'Plasma'], correctAnswer: 'White Blood Cells' },
      { question: 'What is the process by which plants make their food?', options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'], correctAnswer: 'Photosynthesis' },
    ],
    Social: [
      { question: 'Who was the first Prime Minister of India?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Indira Gandhi'], correctAnswer: 'Jawaharlal Nehru' },
      { question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris' },
      { question: 'Which river is known as the lifeline of Egypt?', options: ['Nile', 'Amazon', 'Ganges', 'Yangtze'], correctAnswer: 'Nile' },
      { question: 'In which year did World War II end?', options: ['1942', '1943', '1944', '1945'], correctAnswer: '1945' },
      { question: 'What is the largest continent by area?', options: ['Africa', 'Asia', 'Australia', 'Europe'], correctAnswer: 'Asia' },
    ],
    English: [
      { question: 'What is the synonym of "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctAnswer: 'Joyful' },
      { question: 'Which word is a noun?', options: ['Run', 'Quickly', 'Dog', 'Beautiful'], correctAnswer: 'Dog' },
      { question: 'What is the past tense of "go"?', options: ['Goes', 'Going', 'Went', 'Gone'], correctAnswer: 'Went' },
      { question: 'Which sentence is correct?', options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'], correctAnswer: 'She goes to school.' },
      { question: 'What is the antonym of "big"?', options: ['Large', 'Huge', 'Small', 'Giant'], correctAnswer: 'Small' },
    ],
  };
export default defaultQuestions;