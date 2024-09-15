"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Calendar as CalendarIcon } from 'lucide-react'
import { format } from "date-fns"

const exercises = [
  { value: "bench-press", label: "Bench Press" },
  { value: "squat", label: "Squat" },
  { value: "deadlift", label: "Deadlift" },
  { value: "overhead-press", label: "Overhead Press" },
  { value: "barbell-row", label: "Barbell Row" },
]

interface Set {
  id: number
  weight: number
  repetitions: number
}

interface Workset {
  id: number
  exerciseName: string
  sets: Set[]
  committed: boolean
  date: Date
}

export default function WorksetCreator() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [worksets, setWorksets] = React.useState<Workset[]>([])
  const [weight, setWeight] = React.useState<number>(0)
  const [repetitions, setRepetitions] = React.useState<number>(0)
  const [date, setDate] = React.useState<Date>(new Date())

  const createWorkset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) return
    const exercise = exercises.find(ex => ex.value === value)
    if (!exercise) return
    const newWorkset: Workset = {
      id: Math.floor(Math.random() * 1000),
      exerciseName: exercise.label,
      sets: [],
      committed: false,
      date: date
    }
    setWorksets([...worksets, newWorkset])
    setValue("")
  }

  const addSet = (worksetId: number) => {
    setWorksets(worksets.map(ws =>
      ws.id === worksetId
        ? { ...ws, sets: [...ws.sets, { id: Date.now(), weight, repetitions }] }
        : ws
    ))
    setWeight(0)
    setRepetitions(0)
  }

  const deleteSet = (worksetId: number, setId: number) => {
    setWorksets(worksets.map(ws =>
      ws.id === worksetId
        ? { ...ws, sets: ws.sets.filter(set => set.id !== setId) }
        : ws
    ))
  }

  const deleteWorkset = (worksetId: number) => {
    setWorksets(worksets.filter(ws => ws.id !== worksetId))
  }

  const commitWorkset = (worksetId: number) => {
    setWorksets(worksets.map(ws =>
      ws.id === worksetId
        ? { ...ws, committed: true }
        : ws
    ))
  }

  return (
    <div className="space-y-4 w-full px-4 sm:px-6 md:max-w-2xl md:mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Create New Workset</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createWorkset} className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {value
                    ? exercises.find((exercise) => exercise.value === value)?.label
                    : "Select exercise..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Type a command or search..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup>
                      {exercises.map((exercise) => (
                        <CommandItem
                          key={exercise.value}
                          value={exercise.value}
                          onSelect={(currentValue) => {
                            setValue(currentValue === value ? "" : currentValue)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === exercise.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {exercise.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button type="submit" disabled={!value} className="w-full">
              Create Workset
            </Button>
          </form>
        </CardContent>
      </Card>

      {worksets.map(workset => (
        <Card key={workset.id} className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl">{workset.exerciseName} Workset</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{format(workset.date, "PPP")}</p>
            </div>
            {!workset.committed && (
              <Button variant="ghost" size="icon" onClick={() => deleteWorkset(workset.id)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!workset.committed && (
              <form onSubmit={(e) => { e.preventDefault(); addSet(workset.id); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`weight-${workset.id}`}>Weight</Label>
                  <Input
                    id={`weight-${workset.id}`}
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    placeholder="Weight"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`reps-${workset.id}`}>Repetitions</Label>
                  <Input
                    id={`reps-${workset.id}`}
                    type="number"
                    value={repetitions}
                    onChange={(e) => setRepetitions(Number(e.target.value))}
                    placeholder="Repetitions"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="submit" className="w-full sm:w-1/2">Add Set</Button>
                  <Button type="button" onClick={() => commitWorkset(workset.id)} className="w-full sm:w-1/2">
                    Commit Workset
                  </Button>
                </div>
              </form>
            )}
            {workset.sets.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Sets:</h4>
                <ul className="space-y-2">
                  {workset.sets.map((set, index) => (
                    <li key={set.id} className="bg-secondary p-2 rounded text-sm flex justify-between items-center">
                      <span>Set {index + 1}: Weight: {set.weight}, Reps: {set.repetitions}</span>
                      {!workset.committed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSet(workset.id, set.id)}
                          className="h-6 w-6 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {workset.committed && (
              <p className="mt-4 text-sm text-muted-foreground">This workset has been committed and can no longer be modified.</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
