import os 

class Tamagotchi:
	def __init__(self, tama_name, meal_favori):

		self.name = tama_name
		self.age = 0
		self.hunger = 0
		self.energy = 10
		self.hapiness = 10
		self.meal = meal_favori

	def hello(self):
		print("Hello ! I'm " + self.name + "! ~^_^~")

	def feed(self, food) :
		if self.hunger >= 0 :
			self.hunger -= food

	def heal(self, soin) :
		self.energy += soin

	def play(self, joie) :
		self.hapiness += joie

	def nothing(self) :
		if self.hunger < 10 :
			self.hunger += 1
		if self.hapiness > 0 :
			self.hapiness -= 1

	def show_state(self) :
		if self.energy <= 0 :
			print("(∪｡∪)Zzzz...\n")
		elif self.hapiness <= 0:
			print("(x___x).°°( " + self.meal + " )\n")
		else:
			print("(=^o.o^=)< " + self.name + " !\n")

		print("********************")
		print("hunger: " + str(self.hunger))
		print("energy: " + str(self.energy))
		print("hapiness: " + str(self.hapiness))
		print("********************\n")

	def tour(self) :
		self.show_state()

		if self.energy <= 0 :
			action = input("heal (h) or let it sleep (s) ?\n")
			if action == "h" :
				self.heal(10)
				self.feed(5)
			if action == "s" :
				self.heal(5)
		else :
			self.nothing()
			
			if self.hunger >= 10 :
				self.energy -= 2
			
			action = input("feed (f), sleep (s), play (p) or do nothing (enter) ?\n")
			if action == "f" :
				self.feed(10)
			if action == "h" :
				self.heal(5)
			elif action == "p" :
				self.play(5)


name = input("Hello, what is your tamagotchi's name ?\n")
meal_favori = input("What is its favorite meal ?\n")
os.system('clear')

tama = Tamagotchi(name, meal_favori)

while True :
	tama.tour()
	os.system('clear')