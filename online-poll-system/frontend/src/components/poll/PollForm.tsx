import React, { useState } from "react";
import { createPoll } from "../../services/api";

const PollForm: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Transform options from ["Python"] → [{ text: "Python" }]
    const formattedOptions = options
      .map((opt) => opt.trim())
      .filter((opt) => opt.length > 0)
      .map((opt) => ({ text: opt }));

    const pollData = {
      question,
      description,
      options: formattedOptions,
      expires_at: expiresAt || null,
    };

    try {
      await createPoll(pollData);
      alert("Poll created successfully!");
      setQuestion("");
      setDescription("");
      setOptions(["", ""]);
      setExpiresAt("");
    } catch (error) {
      console.error("Failed to create poll:", error);
      alert("Failed to create poll");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="poll-form">
      <h2>Create a New Poll</h2>

      <label>Question</label>
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Options</label>
      {options.map((opt, index) => (
        <input
          key={index}
          type="text"
          value={opt}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          required
        />
      ))}

      <button type="button" onClick={addOption}>
        Add Option
      </button>

      <label>Expiration Date (optional)</label>
      <input
        type="datetime-local"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
      />

      <button type="submit">Create Poll</button>
    </form>
  );
};

export default PollForm;


