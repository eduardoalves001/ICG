export default {
    'home': () => {
        return {
            type: 'home',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 
    'tree': () => {
        return {
            type: 'tree',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 

    'cloud': () => {
        return {
            type: 'cloud',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 

    'vendingMachine': () => {
        return {
            type: 'vendingMachine',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 

    'windmill': () => {
        return {
            type: 'windmill',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 


    'torii': () => {
        return {
            type: 'torii',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 


    'bench': () => {
        return {
            type: 'bench',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 


    'wall': () => {
        return {
            type: 'wall',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    }, 


    'arcade': () => {
        return {
            type: 'arcade',
            style: Math.floor(3*Math.random()) + 1,
            height: 1,
            updated: true,
            update: function(){
            }
        }
    },
    'road': () => {
        return {
            type: 'road',
            updated: true,
            update: function(){
                this.updated = false;
            }
        }
    }, 

    'sun': () => {
        return {
            type: 'sun',
            updated: true,
            update: function(){
                this.updated = false;
            }
        }
    },

    'moon': () => {
        return {
            type: 'moon',
            updated: true,
            update: function(){
                this.updated = false;
            }
        }
    }


}