"use client"
import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function AIPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'வணக்கம்! நான் Nitara AI Assistant. உங்கள் பண்ணை மேலாண்மை, மாடுகளின் ஆரோக்கியம் அல்லது தீவனக் கணக்கீடு பற்றி என்னிடம் ஏதேனும் கேட்கலாமே?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');
    
    const lowerInput = input.toLowerCase();
    let reply = "மன்னிக்கவும், அதற்கான சரியான பதில் என்னிடம் இல்லை. தீவனம், நோய் (Mastitis, FMD), சினைப்பருவம் (Heat), லாபம் பற்றி நீங்கள் என்னிடம் கேட்கலாம்!";
    
    if (lowerInput.includes('mastitis') || lowerInput.includes('மடிநோய்') || lowerInput.includes('பால் குறை')) {
      reply = "மடிநோய் (Mastitis) அல்லது தீவனப் பற்றாக்குறை காரணமாக பால் திடீரென குறையலாம். உடனடியாக CMT (California Mastitis Test) செய்து பார்க்கவும். மடி வீக்கம் இருக்கிறதா என்று பரிசோதிக்கவும்.";
    } else if (lowerInput.includes('heat') || lowerInput.includes('சினை') || lowerInput.includes('ஊசி')) {
      reply = "மாடு சினைப்பருவத்திற்கு (Heat) வரும்போது கத்துதல், மற்ற மாடுகள் மீது தாவுதல், மெலிதான திரவம் வடிதல் ஆகியவை தென்படும். அறிகுறி தெரிந்த 12-18 மணி நேரத்திற்குள் விந்து ஊசி (AI) போட வேண்டும்.";
    } else if (lowerInput.includes('feed') || lowerInput.includes('தீவனம்') || lowerInput.includes('சாப்பாடு')) {
      reply = "ஒரு 400kg எடையுள்ள மாடு 15 லிட்டர் பால் கறக்கிறது என்றால், அதற்கு தோராயமாக 20kg பச்சைத் தீவனம், 4kg உலர் தீவனம், மற்றும் 6.5kg கலப்புத் தீவனம் (Concentrate) தேவைப்படும்.";
    } else if (lowerInput.includes('profit') || lowerInput.includes('லாபம்') || lowerInput.includes('காசு')) {
      reply = "உங்கள் தினசரி லாபம் = (மொத்தப் பால் வருமானம்) - (மொத்தத் தீவனச் செலவு). இதைத் துல்லியமாக அறிய 'Finance' பக்கத்தைப் பார்க்கவும்.";
    }

    // Mock AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-blue-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900">Nitara AI Assistant</h2>
          <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-blue-100'}`}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5 text-blue-600" />}
            </div>
            <div className={`max-w-[70%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border shadow-sm text-gray-800 rounded-tl-none'}`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about feed calculation, disease symptoms, etc..." 
            className="flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 rounded-lg flex items-center justify-center transition">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
