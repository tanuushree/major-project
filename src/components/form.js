import React, { useState } from 'react';

function DynamicFormBuilder() {
  const [sections, setSections] = useState([]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        name: '',
        type: 'text',
        fields: [],
      },
    ]);
  };

  const addField = (sectionIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].fields.push({
      label: '',
      type: updatedSections[sectionIndex].type,
      placeholder: '',
    });
    setSections(updatedSections);
  };

  const handleSectionTypeChange = (index, event) => {
    const updatedSections = [...sections];
    updatedSections[index].type = event.target.value;
    setSections(updatedSections);
  };

  const handleFieldLabelChange = (sectionIndex, fieldIndex, event) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].fields[fieldIndex].label = event.target.value;
    setSections(updatedSections);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📝 Form</h1>
        <button
          onClick={addSection}
          className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800"
        >
          Create Form
        </button>
      </header>

      <div className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-white shadow-md rounded-lg p-6 border border-gray-300"
          >
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="Section Name"
                value={section.name}
                onChange={(e) => {
                  const updatedSections = [...sections];
                  updatedSections[sectionIndex].name = e.target.value;
                  setSections(updatedSections);
                }}
                className="w-3/4 border border-gray-300 rounded-md p-2 text-lg"
              />
              <select
                onChange={(e) => handleSectionTypeChange(sectionIndex, e)}
                className="border border-gray-300 rounded-md p-2"
              >
                <option value="text">Text Field</option>
                <option value="number">Number Field</option>
                <option value="date">Date Field</option>
                <option value="time">Time Field</option>
                <option value="checkbox">Multiple Choice Field</option>
                <option value="radio">Single Choice Field</option>
                <option value="map">Location Field</option>
              </select>
            </div>

            <button
              onClick={() => addField(sectionIndex)}
              className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add Field
            </button>

            <div className="grid grid-cols-2 gap-6">
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="bg-gray-100 p-4 rounded-lg border border-gray-300"
                >
                  <input
                    type="text"
                    placeholder="Field Label"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldLabelChange(sectionIndex, fieldIndex, e)
                    }
                    className="w-full border border-gray-300 rounded-md p-2 mb-2"
                  />
                  {section.type === 'text' && (
                    <input
                      type="text"
                      placeholder="Enter text"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  )}
                  {section.type === 'number' && (
                    <input
                      type="number"
                      placeholder="Enter number"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  )}
                  {section.type === 'date' && (
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  )}
                  {section.type === 'time' && (
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-md p-2"
                    />
                  )}
                  {section.type === 'checkbox' && (
                    <div>
                      <input type="checkbox" id={`checkbox-${fieldIndex}`} />
                      <label
                        htmlFor={`checkbox-${fieldIndex}`}
                        className="ml-2"
                      >
                        Option
                      </label>
                    </div>
                  )}
                  {section.type === 'radio' && (
                    <div>
                      <input type="radio" id={`radio-${fieldIndex}`} />
                      <label htmlFor={`radio-${fieldIndex}`} className="ml-2">
                        Option
                      </label>
                    </div>
                  )}
                  {section.type === 'map' && (
                    <div className="rounded border overflow-hidden">
                      <img
                        src="https://via.placeholder.com/300x100.png?text=Map+Field"
                        alt="Map placeholder"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {sections.length > 0 && (
        <button
          className="w-full mt-8 bg-green-500 text-white p-4 rounded-md text-lg hover:bg-green-600"
          onClick={() => console.log(sections)}
        >
          Submit Form
        </button>
      )}
    </div>
  );
}

export default DynamicFormBuilder;
