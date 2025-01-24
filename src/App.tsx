import React, { useState } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, SKILL_LIST, CLASS_LIST } from './consts';

const calculateModifier = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  return Math.floor((value - 10) / 2);
};

const createNewCharacter = () => ({
  attributes: ATTRIBUTE_LIST.reduce((acc, attr) => {
    acc[attr] = 10;
    return acc;
  }, {}),
  skills: SKILL_LIST.reduce((acc, skill) => {
    acc[skill.name] = 0;
    return acc;
  }, {}),
  skillPoints: 10,
  selectedClass: null,
});

const saveCharactersToAPI = async (characters) => {
  const response = await fetch('https://recruiting.verylongdomaintotestwith.ca/api/nishchay157/character', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characters),
  });

  if (!response.ok) {
    throw new Error('Failed to save characters');
  }
};

function App() {
  const [characters, setCharacters] = useState([createNewCharacter()]);

  const addNewCharacter = () => {
    setCharacters((prev) => [...prev, createNewCharacter()]);
  };

  const updateCharacter = (index, updatedCharacter) => {
    setCharacters((prev) =>
      prev.map((char, i) => (i === index ? updatedCharacter : char))
    );
  };

  const saveCharacters = () => {
    saveCharactersToAPI(characters)
      .then(() => alert('Characters saved successfully!'))
      .catch((err) => console.error('Error saving characters:', err));
  };

  const CharacterCard = ({ index, character }) => {
    const [selectedClass, setSelectedClass] = useState(character.selectedClass);

    const handleIncrement = (attribute) => {
      const totalAttributes = Object.values(character.attributes).reduce((a, b) => Number(a) + Number(b), 0);
      if (totalAttributes < 70) {
        const updatedCharacter = {
          ...character,
          attributes: {
            ...character.attributes,
            [attribute]: character.attributes[attribute] + 1,
          },
        };
        updateCharacter(index, updatedCharacter);
      } else {
        alert('Total attribute points cannot exceed 70. Decrease one attribute before increasing another.');
      }
    };

    const handleDecrement = (attribute) => {
      const updatedCharacter = {
        ...character,
        attributes: {
          ...character.attributes,
          [attribute]: Math.max(character.attributes[attribute] - 1, 0),
        },
      };
      updateCharacter(index, updatedCharacter);
    };

    const handleSkillIncrement = (skill) => {
      if (character.skillPoints > 0) {
        const updatedCharacter = {
          ...character,
          skills: {
            ...character.skills,
            [skill]: character.skills[skill] + 1,
          },
          skillPoints: character.skillPoints - 1,
        };
        updateCharacter(index, updatedCharacter);
      } else {
        alert('No skill points remaining.');
      }
    };

    const handleSkillDecrement = (skill) => {
      if (character.skills[skill] > 0) {
        const updatedCharacter = {
          ...character,
          skills: {
            ...character.skills,
            [skill]: character.skills[skill] - 1,
          },
          skillPoints: character.skillPoints + 1,
        };
        updateCharacter(index, updatedCharacter);
      } else {
        alert('Skill points cannot be negative.');
      }
    };

    const eligibleClasses = Object.entries(CLASS_LIST).map(([className, requirements]) => {
      const meetsRequirements = Object.entries(requirements).every(
        ([attr, min]) => character.attributes[attr] >= min
      );
      return { className, meetsRequirements };
    });

    const handleClassSelection = (className) => {
      const updatedCharacter = {
        ...character,
        selectedClass: className,
      };
      setSelectedClass(className);
      updateCharacter(index, updatedCharacter);
    };

    return (
      <div className="character-card">
        <h2>Character {index + 1}</h2>
        <div className="character-section">
          <h3>Attributes</h3>
          {ATTRIBUTE_LIST.map((attr) => (
            <div key={attr} className="attribute-row">
              <span>{attr}: {character.attributes[attr]}</span>
              <button onClick={() => handleIncrement(attr)}>+</button>
              <button onClick={() => handleDecrement(attr)}>-</button>
              <span>Modifier: {calculateModifier(character.attributes[attr])}</span>
            </div>
          ))}
        </div>

        <div className="character-section">
          <h3>Classes</h3>
          <ul className="class-list">
            {eligibleClasses.map(({ className, meetsRequirements }) => (
              <li
                key={className}
                onClick={() => meetsRequirements && handleClassSelection(className)}
                style={{
                  color: meetsRequirements ? 'green' : 'red',
                  cursor: meetsRequirements ? 'pointer' : 'not-allowed',
                }}
              >
                {className}
              </li>
            ))}
          </ul>
          {selectedClass && (
            <div>
              <h4>Selected Class: {selectedClass}</h4>
              <ul>
                {Object.entries(CLASS_LIST[selectedClass]).map(([attr, min]) => (
                  <li key={attr}>
                    <span>{`${attr}: ${min}`}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="character-section">
          <h3>Skills</h3>
          <p>Total skill points available: {character.skillPoints}</p>
          {SKILL_LIST.map((skill) => (
            <div key={skill.name} className="skill-row">
              <span>{skill.name} (Modifier: {skill.attributeModifier})</span>
              <button onClick={() => handleSkillIncrement(skill.name)}>+</button>
              <button onClick={() => handleSkillDecrement(skill.name)}>-</button>
              <span>Points: {character.skills[skill.name]}</span>
              <span>Total: {character.skills[skill.name] + calculateModifier(character.attributes[skill.attributeModifier])}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Character Sheet</h1>
        <button onClick={addNewCharacter} className="button">
          Add New Character
        </button>
        <button onClick={saveCharacters} className="button">
          Save All Characters
        </button>
      </header>

      {characters.map((character, index) => (
        <CharacterCard
          key={index}
          index={index}
          character={character}
        />
      ))}
    </div>
  );
}

export default App;
