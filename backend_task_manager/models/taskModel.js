const {DataTypes} = require('sequelize');
const { Sequelize } = require('sequelize');

const Task = Sequelize.afterDefine('Task',{
    title:{
        type: DataTypes.STRING,
        allowNull: false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: false
    },
    status:{
        type: DataTypes.ENUM('pending', 'in-progress', 'completed'),
        defaultValue: 'pending'
    },
    due_date:{
        type: DataTypes.DATE,
        allowNull: true
    }
})

module.exports = Task