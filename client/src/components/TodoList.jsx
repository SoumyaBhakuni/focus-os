import { useState, useContext } from 'react';
import axios from 'axios';
import { Plus, Check, X, ListTodo } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function TodoList() {
  const { user, loadUser } = useContext(AuthContext);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const updatedTodos = [...user.todos, { text: newTodo, isCompleted: false }];
    await syncTodos(updatedTodos);
    setNewTodo('');
  };

  const toggleTodo = async (index) => {
    const updatedTodos = [...user.todos];
    updatedTodos[index].isCompleted = !updatedTodos[index].isCompleted;
    await syncTodos(updatedTodos);
  };

  const deleteTodo = async (index) => {
    const updatedTodos = user.todos.filter((_, i) => i !== index);
    await syncTodos(updatedTodos);
  };

  const syncTodos = async (todos) => {
    try {
      await axios.put('http://localhost:5000/api/auth/todos', { todos });
      loadUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-2xl backdrop-blur-sm h-full flex flex-col">
      <h3 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
        <ListTodo size={16} /> Daily Objectives
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4 custom-scrollbar">
        {user?.todos?.map((todo, index) => (
          <div key={index} className="group flex items-center gap-3 bg-black/40 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
            <button 
              onClick={() => toggleTodo(index)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${todo.isCompleted ? 'bg-primary border-primary' : 'border-zinc-600 hover:border-primary'}`}
            >
              {todo.isCompleted && <Check size={12} className="text-black" />}
            </button>
            <span className={`flex-1 text-sm ${todo.isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(index)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
        {user?.todos?.length === 0 && <div className="text-zinc-600 text-xs italic text-center py-4">No active tasks</div>}
      </div>

      <form onSubmit={addTodo} className="relative">
        <input 
          type="text" 
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="w-full bg-black border border-white/10 rounded-lg py-2 pl-3 pr-10 text-sm text-white focus:border-primary outline-none"
          placeholder="Add new objective..."
        />
        <button type="submit" className="absolute right-2 top-2 text-zinc-400 hover:text-primary">
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}