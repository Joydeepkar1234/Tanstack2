import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface Contact {
  id: number;
  name: string;
  phone: string;
}


const fetchContacts = async (): Promise<Contact[]> => {
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/users?_limit=6");
  return data.map(({ id, name, phone }: { id: number; name: string; phone: string }) => ({ id, name, phone }));
};


const addContact = async (contact: Omit<Contact, "id">): Promise<Contact> => {
  const { data } = await axios.post("https://jsonplaceholder.typicode.com/users", contact);
  return data;
};


const deleteContact = async (id: number): Promise<number> => {
  await axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`);
  return id;
};

const ContactList: React.FC = () => {
  const [form, setForm] = useState({ name: "", phone: "" });
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading, isError } = useQuery<Contact[], Error>({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
    staleTime: Infinity,
  });


  const addMutation = useMutation<Contact, Error, Omit<Contact, "id">>({
    mutationFn: addContact,
    onSuccess: (newContact) => {
      
      queryClient.setQueryData<Contact[]>(["contacts"], (oldContacts = []) => [...oldContacts, newContact]);
    },
  });

  
  const deleteMutation = useMutation<number, Error, number>({
    mutationFn: deleteContact,
    onSuccess: (id) => {
     
      queryClient.setQueryData<Contact[]>(["contacts"], (oldContacts = []) =>
        oldContacts.filter((contact) => contact.id !== id)
      );
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleAdd = () => {
    if (!form.name || !form.phone) return;
    addMutation.mutate(form);
    setForm({ name: "", phone: "" });
  };

  return (
    <div>
      <h2>Contact Numbers</h2>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error loading contacts</p>}

      <ul>
        {contacts.map(({ id, name, phone }) => (
          <li key={id}>
            {name} - {phone}
            <button onClick={() => deleteMutation.mutate(id)}>❌</button>
          </li>
        ))}
      </ul>

      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <button onClick={handleAdd} disabled={!form.name || !form.phone}>
        ➕ Add
      </button>
    </div>
  );
};

export default ContactList;