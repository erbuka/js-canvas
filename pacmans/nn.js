class Neuron
{
	constructor(inputCount)
	{
		this.inputCount = inputCount;
		this.inputs = [];
		this.weights = [];
		this.bias = Math.random();
		this.output = 0;

		for(var i = 0; i < inputCount; i++)
		{
			this.inputs.push(0);
			this.weights.push(Math.random() * 2 - 1);
		}
	}

	setInput(i, value)
	{
		this.inputs[i] = value;
	}

	activation()
	{
		var v = 0;
		for(var i = 0; i < this.inputCount; i++)
		{
			v += this.inputs[i] * this.weights[i];
		}

		var z = v + this.bias;

		this.output = 1 / (1 + Math.exp(-z));

	}

	clone()
	{
		var result = new Neuron(this.inputCount);

		result.bias = this.bias;
		for(var i = 0; i < this.inputCount; i++)
		{
			result.weights[i] = this.weights[i];
		}

		return result;
	}

	cross(other, t)
	{
		if(this.inputCount != other.inputCount)
		{
			throw "Invalid neuron crossing";
		}

		var icount = this.inputCount; // Input count

		var result = new Neuron(icount);
		var ci = Math.floor(t * icount); // crossing index

		for(var i = 0; i < icount; i++)
		{
			result.weights[i] = i <= ci ? this.weights[i] : other.weights[i];
		}

		result.bias = (1 - t) * this.bias + t * other.bias;

		return result;		
	}
}

class NeuralNetwork
{
	constructor()
	{
		this.neurons = [];
	}

	length()
	{
		return this.neurons.length;
	}

	at(index)
	{
		return this.neurons[index];
	}
	cross(other, t)
	{
		if(this.length() != other.length())
		{
			throw "Can't cross networks with different neuron count";
		}
		var result = new NeuralNetwork();
		var ci = Math.floor(this.length() * t);

		for(var i = 0; i < this.length(); i++)
		{
			if(i < ci) result.neurons.push(this.neurons[i].clone());
			else if(i > ci) result.neurons.push(other.neurons[i].clone());
			else result.neurons.push(this.neurons[i].cross(other.neurons[i], t));
		}

		return result;
	}
}