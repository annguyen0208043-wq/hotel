from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'username', 'first_name', 'last_name', 
                 'email', 'phone', 'address', 'position', 'salary', 'shift', 
                 'hire_date', 'is_active', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
            'salary': {'write_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        employee = Employee(**validated_data)
        if password:
            employee.set_password(password)
        employee.save()
        return employee

class EmployeeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['phone', 'address', 'position', 'salary', 'shift', 'is_active']